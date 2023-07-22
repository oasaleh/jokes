import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";

import { db } from "~/utils/db.server";

export const loader = async () => {
  return json({
    jokes: await db.joke.findMany(),
  });
};

export default function JokesRoute() {
  let data = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>J🤪KES</h1>
      <body>
        <ul>
          {data.jokes.map(({ id, name }) => (
            <li key={id}>
              <Link to={id}>{name}</Link>
            </li>
          ))}
        </ul>
        <Outlet />
      </body>
    </div>
  );
}

