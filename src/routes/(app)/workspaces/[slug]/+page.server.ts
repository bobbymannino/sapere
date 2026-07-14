import { listDocuments } from "$db/documents";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ parent }) => {
  const { workspace, user } = await parent();

  const documentsPromise = listDocuments({
    userId: user.id,
    workspaceId: workspace.id,
  });

  return { documentsPromise };
};
