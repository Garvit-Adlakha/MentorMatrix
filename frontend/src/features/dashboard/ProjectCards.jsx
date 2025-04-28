import React from 'react';
import { HoverEffect } from '../../components/ui/card-hover-effect';

const ProjectCards = ({ proposals, userRole, handleViewDetails }) => {
  // Format proposals as items for HoverEffect component
  const getHoverEffectItems = () => {
    return proposals.map(proposal => ({
      title: proposal.title,
      description: typeof proposal.description === 'object'
        ? proposal.description?.abstract || 'No description available'
        : proposal.description || 'No description available',
      id: proposal.id,
      status: proposal.status,
      studentName: proposal.studentName,
      facultyName: proposal.facultyName,
      createdAt: proposal.createdAt,
      // Add any other fields you want to display in the card
    }));
  };
  // Wrap HoverEffect to handle click events
  const HoverEffectWithClicks = () => {
    return (
      <div className="w-full" onClick={(e) => {
        // Find the nearest anchor tag and get its index from data attribute
        const anchor = e.target.closest('a');
        if (anchor) {
          e.preventDefault();
          const idx = parseInt(anchor.dataset.idx);
          if (!isNaN(idx) && proposals[idx]) {
            handleViewDetails(proposals[idx].id);
          }
        }
      }}>
        <HoverEffect 
          items={getHoverEffectItems()}
          className="gap-4"
        />
      </div>
    );
  };

  return (
    <>
      {proposals.length > 0 ? (
        <HoverEffectWithClicks />
      ) : (
        <EmptyState />
      )}
    </>
  );
};

const EmptyState = () => {
  return (
    <div className="col-span-full bg-card p-10 rounded-xl border border-border/40 text-center">
      <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-alert-triangle text-primary" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <path d="M12 9v4"></path>
          <path d="M12 16v.01"></path>
          <path d="M3.201 12.872l8.4 -10.2c.263 -.319 .754 -.319 1.017 0l8.4 10.2c.199 .241 .181 .6 -.045 .82l-.319 .309c-.097 .094 -.217 .156 -.348 .179l-.199 .021h-16.8c-.414 0 -.75 -.336 -.75 -.75c0 -.162 .046 -.314 .125 -.442l.08 -.088l.319 -.309z"></path>
        </svg>
      </div>
      <h3 className="text-xl font-medium mb-2">No Projects Found</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        There are no projects matching your current filters. Try adjusting your search or add a new project.
      </p>
      <button 
        className="px-6 py-3 bg-primary text-white rounded-lg font-medium inline-flex items-center gap-2"
      >
        Create New Project
        <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-arrow-right" width="18" height="18" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <path d="M5 12l14 0"></path>
          <path d="M13 18l6 -6"></path>
          <path d="M13 6l6 6"></path>
        </svg>
      </button>
    </div>
  );
};

export default ProjectCards;