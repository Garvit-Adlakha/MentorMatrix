import React from 'react';
import { IconFileDescription, IconClipboardList, IconBriefcase, IconCode } from '../ui/Icons';

const OverviewSection = ({ description }) => (
  <div>
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <IconFileDescription size={18} className="text-primary flex-shrink-0" />
        <h2 className="text-xl font-semibold">Abstract</h2>
      </div>
      <p className="text-muted-foreground mb-6 whitespace-pre-wrap break-words">
        {description?.abstract || 'No abstract available'}
      </p>
      <div className="flex items-center gap-2 mb-3">
        <IconClipboardList size={18} className="text-primary flex-shrink-0" />
        <h2 className="text-xl font-semibold">Problem Statement</h2>
      </div>
      <p className="text-muted-foreground mb-6 whitespace-pre-wrap break-words">
        {description?.problemStatement || 'No problem statement available'}
      </p>
      <div className="flex items-center gap-2 mb-3">
        <IconBriefcase size={18} className="text-primary flex-shrink-0" />
        <h2 className="text-xl font-semibold">Proposed Methodology</h2>
      </div>
      <p className="text-muted-foreground whitespace-pre-wrap break-words">
        {description?.proposedMethodology || 'No methodology available'}
      </p>
    </div>
    {description?.techStack && description.techStack.length > 0 && (
      <div className="mt-10">
        <div className="flex items-center gap-2 mb-4">
          <IconCode size={18} className="text-primary flex-shrink-0" />
          <h2 className="text-xl font-semibold">Technologies</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {description.techStack.map((tech, index) => (
            <span key={index} className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm">
              {tech}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default OverviewSection;
