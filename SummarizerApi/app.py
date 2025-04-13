from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import os
import pickle
import torch
from transformers import PegasusTokenizer
from rouge_score import rouge_scorer

app = FastAPI()

# Model paths
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")

# Initialize tokenizer and model as None
model = None
tokenizer = None
scorer = None

# Load model on startup
@app.on_event("startup")
async def startup_event():
    global model, tokenizer, scorer
    try:
        print(f"Loading model from {MODEL_PATH}")
        with open(MODEL_PATH, "rb") as file:
            model = pickle.load(file)
        
        # Load PEGASUS tokenizer
        tokenizer = PegasusTokenizer.from_pretrained("google/pegasus-cnn_dailymail")
        
        # Initialize ROUGE scorer
        scorer = rouge_scorer.RougeScorer(['rouge1', 'rouge2', 'rougeL'], use_stemmer=True)
        
        print("Model and tokenizer loaded successfully!")
    except Exception as e:
        print(f"Error loading model: {e}")

class ProjectDescription(BaseModel):
    abstract: str = Field(...)
    problemStatement: str = Field(...)
    proposedMethodology: str = Field(...)
    expectedOutcomes: Optional[str] = Field(None)
    relevance: Optional[str] = Field(None)
    techStack: Optional[List[str]] = Field(None)

class ProjectDetails(BaseModel):
    title: str = Field(...)
    description: ProjectDescription = Field(...)
    team_members: Optional[List[str]] = Field(None)

class SummarizationRequest(BaseModel):
    text: str = Field(...)
    max_length: Optional[int] = Field(150)
    num_beams: Optional[int] = Field(4)

class ProjectSummarizationRequest(BaseModel):
    project: ProjectDetails = Field(...)
    max_length: Optional[int] = Field(150)
    num_beams: Optional[int] = Field(4)

@app.post("/api/summarize/")
async def summarize_text(request: SummarizationRequest):
    global model, tokenizer
    
    if not model or not tokenizer:
        raise HTTPException(status_code=500, detail="Model or tokenizer not loaded")
    
    try:
        # Set device (CPU or GPU)
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        model.to(device)
        
        # Tokenize input text
        inputs = tokenizer(request.text, max_length=1024, truncation=True, return_tensors="pt").to(device)
        
        # Generate summary
        summary_ids = model.generate(
            inputs["input_ids"], 
            max_length=request.max_length, 
            num_beams=request.num_beams, 
            early_stopping=True
        )
        
        # Decode the generated summary
        summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        
        return {
            "status": "success",
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}")

@app.post("/api/summarize-project/")
async def summarize_project(request: ProjectSummarizationRequest):
    """
    Summarize project details by combining all project information
    into a single text and then generating a summary.
    """
    project = request.project
    
    # Combine project details into a single text similar to the format used in training
    project_text = f"""
    Title: {project.title}
    
    Abstract: {project.description.abstract}
    
    Problem Statement: {project.description.problemStatement}
    
    Proposed Methodology: {project.description.proposedMethodology}
    
    Expected Outcomes: {project.description.expectedOutcomes or "Not specified"}
    
    Relevance: {project.description.relevance or "Not specified"}
    
    Tech Stack: {', '.join(project.description.techStack) if project.description.techStack else 'Not specified'}
    
    Team Members: {', '.join(project.team_members) if project.team_members else 'Not specified'}
    """
    
    # Create a summarization request
    summarization_request = SummarizationRequest(
        text=project_text,
        max_length=request.max_length,
        num_beams=request.num_beams
    )
    
    # Call the text summarization endpoint
    return await summarize_text(summarization_request)

@app.post("/api/evaluate-summary/")
async def evaluate_summary(reference: str, generated: str):
    """
    Evaluate a generated summary against a reference summary using ROUGE scores.
    """
    global scorer
    
    if not scorer:
        raise HTTPException(status_code=500, detail="ROUGE scorer not initialized")
    
    try:
        # Calculate ROUGE scores
        scores = scorer.score(reference, generated)
        
        # Format scores for response
        formatted_scores = {}
        for rouge_type, score in scores.items():
            formatted_scores[rouge_type] = {
                "precision": score.precision,
                "recall": score.recall,
                "f1": score.fmeasure
            }
        
        return {
            "status": "success",
            "scores": formatted_scores
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating ROUGE scores: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Welcome to Project Summarizer API"}
