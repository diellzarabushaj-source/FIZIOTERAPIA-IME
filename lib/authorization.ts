export {
  actorCanAccessPhysioResource,
  assertPhysioOwnership,
  getActorContext as getAuthorizedUser,
  requireActor as requireAuthenticatedUser,
  requirePhysioActor as requirePhysio,
  requireAdminActor as requireAdmin,
  requireOwnerActor as requireOwner,
  type ActorContext as AuthorizedUser,
} from "@/lib/backend/access";

export { isOwnerOrAdmin as isAdminRole, type WorkspaceRole as AppRole } from "@/lib/backend/domain";
