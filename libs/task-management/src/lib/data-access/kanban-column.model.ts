export type kanbanColumn = {
    id: KanbanColumnId;
    name: KanbanColumnName;
    order: number;
    statusIds: string[];// list of status that can be in this column like "To Do", "In Progress", "Done"
    defaultStatusId: string;// when moving a task to this column, this status will be set to the task
}

export type KanbanColumnId = string & { readonly __brand: 'KanbanColumnId' };
export type KanbanColumnName = {
    arabic: string;
    english: string;
};