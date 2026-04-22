/**
 * In-memory job store for processing status.
 * For production, replace with Redis or a DB.
 */
import { ProcessingStatus } from '@/types';

const jobs = new Map<string, ProcessingStatus>();

export function createJob(jobId: string): ProcessingStatus {
  const job: ProcessingStatus = {
    jobId,
    status: 'queued',
    progress: 0,
    currentStep: 'Queued',
    steps: [],
  };
  jobs.set(jobId, job);
  return job;
}

export function getJob(jobId: string): ProcessingStatus | undefined {
  return jobs.get(jobId);
}

export function updateJob(jobId: string, update: Partial<ProcessingStatus>) {
  const job = jobs.get(jobId);
  if (job) {
    jobs.set(jobId, { ...job, ...update });
  }
}

export function addStep(
  jobId: string,
  step: string,
  status: 'pending' | 'processing' | 'done' | 'error',
  detail?: string
) {
  const job = jobs.get(jobId);
  if (!job) return;

  const existing = job.steps.findIndex((s) => s.step === step);
  const entry = { step, status, detail, timestamp: Date.now() };

  if (existing >= 0) {
    job.steps[existing] = entry;
  } else {
    job.steps.push(entry);
  }

  jobs.set(jobId, { ...job, currentStep: step });
}

// Clean up old jobs after 30 minutes
setInterval(() => {
  const cutoff = Date.now() - 30 * 60 * 1000;
  for (const [id, job] of jobs.entries()) {
    const lastStep = job.steps[job.steps.length - 1];
    if (lastStep && lastStep.timestamp < cutoff) {
      jobs.delete(id);
    }
  }
}, 5 * 60 * 1000);
