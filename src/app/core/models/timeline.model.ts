import { JobStatus } from '../enums/job-status.enum';

export type TimelineStepStatus = 'done' | 'active' | 'pending' | 'failed';

export interface TimelineStep {
  status:       TimelineStepStatus;
  job_status:   JobStatus;
  step_number:  number;
  title:        string;
  description:  string;
  timestamp:    string | null;
  actor_name:   string | null;
  notes:        string | null;
}

export interface JobTimeline {
  job_id:         string;
  request_number: string;
  current_status: JobStatus;
  steps:          TimelineStep[];
}