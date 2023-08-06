import type { LoaderArgs, ActionArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, isRouteErrorResponse, useLoaderData, useParams, useRouteError } from "@remix-run/react";
import JokeDisplay from "~/components/joke";

import { db } from "~/utils/db.server";
import { getUserId, requireUserId } from "~/utils/session.server";

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  const { description, title } = data
    ? {
        description: `Enjoy the "${data.joke.name}" joke and much more`,
        title: `"${data.joke.name}" joke`,
      }
    : { description: "No joke found", title: "No joke" };

  return [
    { name: "description", content: description },
    { name: "twitter:description", content: description },
    { title },
  ];
};

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

export const loader = async ({ params, request }: LoaderArgs) => {
  const jokeId = params.jokeId;
  const userId = await getUserId(request);

  const joke = await db.joke.findUnique({
    where: { id: jokeId },
  });

  if (!joke) {
    throw new Response("What a joke! Not found.", {
      status: 404,
    });
  }

  // Using joke.id instead of jokeId because the jokeId is coming from the param. You don't know if it's a valid jokeId (yet.)
  return json({ isOwner: userId === joke.jokesterId, joke });
};

export const action = async ({ params, request }: ActionArgs) => {
  const form = await request.formData();
  const intent = form.get("intent");

  if (intent !== "delete") {
    throw new Response(`The intent ${form.get("intent")} is not supported`, { status: 400 });
  }

  // The following will check if the user is logged in. If not, it will throw a redirect to the login page.
  const userId = await requireUserId(request);

  // Get the joke from the db using the jokeId from the params.
  const joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });

  if (!joke) {
    throw new Response("Can't delete what does not exist", {
      status: 404,
    });
  }
  console.log("first");

  if (joke.jokesterId !== userId) {
    throw new Response("Pssh, nice try. That's not your joke", {
      status: 403,
    });
  }

  await db.joke.delete({
    where: { id: params.jokeId },
  });

  return redirect("/jokes", {
    headers: {
      "flash-message": "Joke deleted",
    },
  });
};

export default function JokeRoute() {
  const data = useLoaderData<typeof loader>();
  const isOwner = data.isOwner;

  return <JokeDisplay isOwner={isOwner} joke={data.joke} />;
}

export function ErrorBoundary() {
  const { jokeId } = useParams();
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 400) {
      return <div className="error-container">What you're trying to do is not allowed.</div>;
    }
    if (error.status === 403) {
      return <div className="error-container">{error.data}</div>;
    }
    if (error.status === 404) {
      return <div className="error-container">Huh? What the heck is "{jokeId}"?</div>;
    }
  }

  return <div className="error-container">There was an error loading joke by the id "${jokeId}". Sorry.</div>;
}
