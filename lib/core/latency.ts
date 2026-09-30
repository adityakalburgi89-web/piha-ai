export class LatencyTracker {
  private checkpoints: Map<string, number> = new Map();

  mark(checkpointName: string): void {
    this.checkpoints.set(checkpointName, performance.now());
  }

  getDuration(fromCheckpoint: string, toCheckpoint: string): number | null {
    const start = this.checkpoints.get(fromCheckpoint);
    const end = this.checkpoints.get(toCheckpoint);
    if (start === undefined || end === undefined) return null;
    return Math.round((end - start) * 100) / 100;
  }
}
