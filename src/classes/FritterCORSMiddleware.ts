//
// Imports
//

import type { FritterMiddlewareFunction } from "@fritter/core";

//
// Class
//

/** Options for a FritterCORSMiddleware instance. */
export interface FritterCORSMiddlewareOptions
{
	/** The origins to allow. */
	allowCredentialsOrigins? : string[];
}

/** A class for creating middlewares that add CORS headers to responses. */
export class FritterCORSMiddleware
{
	/** The middleware function. */
	public readonly execute : FritterMiddlewareFunction;

	/** The options for the middleware. */
	public allowCredentialsOrigins : string[];

	/** Constructs a new FritterCORSMiddleware instance. */
	public constructor(options : FritterCORSMiddlewareOptions = {})
	{
		this.allowCredentialsOrigins = options.allowCredentialsOrigins ?? [];

		this.execute = async (context, next) =>
		{
			//
			// Get Request Origin
			//

			const origin = context.fritterRequest.getOrigin();

			//
			// Append Origin to Vary Header
			//

			context.fritterResponse.appendVaryHeaderName("Origin");

			//
			// Set CORS Headers
			//

			if (origin != null && this.allowCredentialsOrigins.includes(origin))
			{
				context.fritterResponse.setHeaderValue("Access-Control-Allow-Credentials", "true");
				context.fritterResponse.setHeaderValue("Access-Control-Allow-Origin", origin);
			}
			else
			{
				context.fritterResponse.setHeaderValue("Access-Control-Allow-Credentials", "false");
				context.fritterResponse.setHeaderValue("Access-Control-Allow-Origin", "*");
			}

			//
			// Preflight Response
			//

			if (context.fritterRequest.getHttpMethod() == "OPTIONS")
			{
				context.fritterResponse.setHeaderValue("Access-Control-Allow-Headers", context.fritterRequest.getHeaderValue("Access-Control-Request-Headers") ?? "");
				context.fritterResponse.setStatusCode(204);

				return;
			}

			//
			// Execute Next Middleware
			//

			await next();
		};
	}
}