import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, isRouteErrorResponse, useLoaderData, useParams, useRouteError } from "@remix-run/react";

import { db } from "~/utils/db.server";

// Everything that's passed into the loader:
// const data = {
//   request: {
//     size: 0,
//     follow: 20,
//     compress: true,
//     counter: 0,
//     agent: undefined,
//     highWaterMark: 16384,
//     insecureHTTPParser: false,
//     [Symbol('Body internals')]: {
//       body: null,
//       type: null,
//       size: 0,
//       boundary: null,
//       disturbed: false,
//       error: null
//     },
//     [Symbol('Request internals')]: {
//       method: 'GET',
//       redirect: 'follow',
//       headers: {
//         // Add your headers here
//       },
//       credentials: 'same-origin',
//       parsedURL: new URL(''),
//       signal: new AbortSignal()
//     }
//   },
//   context: {},
//   params: { jokeId: 'd501af95-4a1a-4876-a486-4d94f5262c56' }
// };

export const loader = async ({ params }: LoaderArgs) => {
  const jokeId = params.jokeId;

  const joke = await db.joke.findUnique({
    where: { id: jokeId },
  });

  if (!joke) {
    throw new Response("What a joke! Not found.", {
      status: 404,
    });
  }

  return json({ joke });
};

export default function JokeRoute() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <p>Here's your hilarious joke:</p>
      <p>{data.joke.content}</p>
      <Link to=".">{data.joke.name} Permalink</Link>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const { jokeId } = useParams();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <div className="error-container">Huh? What the heck is "{jokeId}"?</div>;
  }

  return <div className="error-container">There was an error loading joke by the id "${jokeId}". Sorry.</div>;
}

