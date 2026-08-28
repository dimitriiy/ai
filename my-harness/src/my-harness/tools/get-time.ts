import type { LocalTool } from "../types";

export const getTime: LocalTool = {
  definition: {
    name: "get_time",
    description:
      'Возвращает текущую дату и время в формате "hh:mm dd/mm/yyyy".',
    input_schema: {
      type: "object",
      properties: {},
    },
  },

  handler: async () => {
    const display = new Date().toISOString();
    return { content: display, display };
  },
};
