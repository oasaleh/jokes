import type { Joke } from ".prisma/client";
import { Form, Link } from "@remix-run/react";

// We have canDelete and isOwner to prevent the owner of the joke to be able to delete it in specific view.
export default function JokeDisplay({
  canDelete = true,
  isOwner,
  joke,
}: {
  canDelete?: boolean;
  isOwner: boolean;
  joke: Pick<Joke, "content" | "name">;
}) {
  console.log("This is JokeDisplay.");
  return (
    <div>
      <p>Here's your hilarious joke:</p>
      <blockquote>{joke.content}</blockquote>
      <Link to=".">{joke.name} Permalink</Link>
      {isOwner ? (
        <Form method="post">
          <button className="button" disabled={!canDelete} type="submit" name="intent" typeof="submit" value="delete">
            Delete
          </button>
        </Form>
      ) : null}
    </div>
  );
}
