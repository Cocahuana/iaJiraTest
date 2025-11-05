import "@auth0/nextjs-auth0/client";

declare module "@auth0/nextjs-auth0/client" {
	interface UserProfile {
		role?: string;
	}
}
