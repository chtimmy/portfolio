'use client';

import type { Project } from '../projects';
import { ProjectContent } from '../ProjectContent';
import { DossierCard } from './dossier/DossierCard';
import { AutomationsSpiral } from './spiral/AutomationsSpiral';
import { CaseStudyJourney } from './journey/CaseStudyJourney';

/** Optional controlled-flip wiring for the résumé dossier, threaded from the page (for exit-intent). */
export interface NodeSubpageProps {
  project: Project;
  dossierFlipped?: boolean;
  onDossierFlippedChange?: (flipped: boolean) => void;
}

/**
 * Routes a node to its subpage (rendered inside the SceneLightbox panel). Each node type gets a
 * distinct experience; anything without one falls back to the simple project content.
 */
export function NodeSubpage({ project, dossierFlipped, onDossierFlippedChange }: NodeSubpageProps) {
  switch (project.id) {
    case 'resume':
      return <DossierCard flipped={dossierFlipped} onFlippedChange={onDossierFlippedChange} />;
    case 'automations':
      return <AutomationsSpiral />;
    case 'umbra':
    case 'meeting-os':
      return <CaseStudyJourney slug={project.id} />;
    default:
      return <ProjectContent project={project} />;
  }
}
