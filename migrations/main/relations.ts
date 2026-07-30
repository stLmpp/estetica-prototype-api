import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
	authAccount: {
		authUser: r.one.authUser({
			from: r.authAccount.userId,
			to: r.authUser.id
		}),
	},
	authUser: {
		authAccounts: r.many.authAccount(),
		authOrganizationsViaAuthInvitation: r.many.authOrganization({
			from: r.authUser.id.through(r.authInvitation.inviterId),
			to: r.authOrganization.id.through(r.authInvitation.organizationId),
			alias: "authUser_id_authOrganization_id_via_authInvitation"
		}),
		authOrganizationsViaAuthMember: r.many.authOrganization({
			alias: "authOrganization_id_authUser_id_via_authMember"
		}),
	},
	authOrganization: {
		authUsersViaAuthInvitation: r.many.authUser({
			alias: "authUser_id_authOrganization_id_via_authInvitation"
		}),
		authUsersViaAuthMember: r.many.authUser({
			from: r.authOrganization.id.through(r.authMember.organizationId),
			to: r.authUser.id.through(r.authMember.userId),
			alias: "authOrganization_id_authUser_id_via_authMember"
		}),
	},
}))