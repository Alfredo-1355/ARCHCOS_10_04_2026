import { TemplateTask } from '../data/projectTemplate';
import { GanttTask, GanttLink } from '../store/useGanttStore';

export function generateSmartSchedule(
  template: TemplateTask[],
  startOffset: number = 0
): { tasks: GanttTask[]; links: GanttLink[] } {
  const tasks: GanttTask[] = [];
  const links: GanttLink[] = [];
  const taskMap = new Map<string, GanttTask>();

  // Helper to get all nodes that depends on nothing (roots)
  const sorted: string[] = [];
  const visited = new Set<string>();
  const tempVisited = new Set<string>();

  function visit(id: string) {
    if (tempVisited.has(id)) throw new Error('Circular dependency detected');
    if (visited.has(id)) return;

    tempVisited.add(id);
    const task = template.find(t => t.id === id);
    if (!task) return;

    // Visit dependencies first
    if (task.dependsOn) {
      for (const depId of task.dependsOn) {
        visit(depId);
      }
    }

    tempVisited.delete(id);
    visited.add(id);
    sorted.push(id);
  }

  // Perform full topological sort
  template.forEach(t => visit(t.id));

  // Sequence nodes and calculate columns
  sorted.forEach(id => {
    const templateTask = template.find(t => t.id === id)!;
    
    let startCol = startOffset;

    // Calculate startCol based on dependencies
    if (templateTask.dependsOn && templateTask.dependsOn.length > 0) {
      const parentEnds = templateTask.dependsOn.map(depId => {
        const parent = taskMap.get(depId);
        return parent ? parent.startCol + parent.durationCols : 0;
      });
      // Parallel Rule: Use the maximum end col of all parents as the start
      startCol = Math.max(...parentEnds);
    }

    const newTask: GanttTask = {
      id: templateTask.id,
      name: templateTask.name,
      categoryId: templateTask.category,
      type: templateTask.type || 'refinement',
      startCol: startCol,
      baselineStartCol: startCol,
      durationCols: templateTask.duration,
      progress: 0,
      assigneeId: null,
      zeroFloat: templateTask.type === 'critical'
    };

    tasks.push(newTask);
    taskMap.set(id, newTask);

    // Create links for the graph
    if (templateTask.dependsOn) {
      templateTask.dependsOn.forEach(depId => {
        links.push({
          id: `link_${depId}_${id}`,
          sourceId: depId,
          targetId: id
        });
      });
    }
  });

  return { tasks, links };
}
