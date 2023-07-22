import { LiveReload, Outlet, Links, Link } from "@remix-run/react";

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Remix: So great, it's funny!</title>
        <Links />
      </head>
      <body>
        <nav>
          <Link to={`jokes`}>Jokes</Link>
        </nav>
        <Outlet />
        <LiveReload />
      </body>
    </html>
  );
}

