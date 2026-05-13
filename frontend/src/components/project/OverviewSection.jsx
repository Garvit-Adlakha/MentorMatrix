import React from 'react';
import { IconFileDescription, IconClipboardList, IconBriefcase, IconCode } from '../ui/Icons';

const OverviewSection = ({ description }) => (
  <div>
    <div className="mb-8">
      <div className="project-section-title">
        <IconFileDescription size={18} className="text-primary flex-shrink-0" />
        <h2>Abstract</h2>
      </div>
      <p className="project-section-text">
        {description?.abstract || 'No abstract available'}
      </p>
      <div className="project-section-title">
        <IconClipboardList size={18} className="text-primary flex-shrink-0" />
        <h2>Problem Statement</h2>
      </div>
      <p className="project-section-text">
        {description?.problemStatement || 'No problem statement available'}
      </p>
      <div className="project-section-title">
        <IconBriefcase size={18} className="text-primary flex-shrink-0" />
        <h2>Proposed Methodology</h2>
      </div>
      <p className="project-section-text">
        {description?.proposedMethodology || 'No methodology available'}
      </p>
    </div>
    {description?.techStack && description.techStack.length > 0 && (
      <div className="mt-10">
        <div className="project-section-title">
          <IconCode size={18} className="text-primary flex-shrink-0" />
          <h2>Technologies</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {description.techStack.map((tech, index) => (
            <span key={index} className="project-chip">
              {tech}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default OverviewSection;
