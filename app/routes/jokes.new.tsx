import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { badRequest } from "~/utils/request.server";

import { db } from "~/utils/db.server";
import { useActionData } from "@remix-run/react";
import { requireUserId } from "~/utils/session.server";

// request is:
// {
//   "request": {
//     "size": 0,
//     "follow": 20,
//     "compress": true,
//     "counter": 0,
//     "agent": null,
//     "highWaterMark": 16384,
//     "insecureHTTPParser": false,
//     "[Symbol(Body internals)]": {
//       "body": "[ReadableStream]",
//       "type": null,
//       "size": null,
//       "boundary": null,
//       "disturbed": false,
//       "error": null
//     },
//     "[Symbol(Request internals)]": {
//       "method": "POST",
//       "redirect": "follow",
//       "headers": {
//         // The actual headers can be provided here
//       },
//       "credentials": "same-origin",
//       "parsedURL": {},
//       "signal": {}
//     }
//   },
//   "context": {},
//   "params": {}
// }

// Validation methods
const validateContentLength = (content: string) => {
  if (content.length < 10) {
    return "That joke is too short";
  }
};

const validateNameLength = (name: string) => {
  if (name.length < 3) {
    return "That joke's name is too short";
  }
};

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const form = await request.formData();
  const content = form.get("content");
  const name = form.get("name");

  if (typeof content !== "string" || typeof name !== "string") {
    const res = badRequest({
      fieldErrors: null,
      fields: null,
      formError: "Form not submitted correctly.",
    });

    return res;
  }

  const fields = { content, name };

  const fieldErrors = {
    content: validateContentLength(content),
    name: validateNameLength(name),
  };

  // If there are any errors, return the form with the errors
  if (Object.values(fieldErrors).some(Boolean)) {
    const res = badRequest({
      fieldErrors,
      fields,
      formError: null,
    });
    return res;
  }

  // Save the joke to the database
  const joke = await db.joke.create({
    data: {
      ...fields,
      jokesterId: userId,
    },
  });

  // Redirect to the permalink for the joke
  return redirect(`/jokes/${joke.id}`);
}

export default function NewJokeRoute() {
  // First time this component is rendered, actionData will be undefined
  const actionData = useActionData<typeof action>();

  return (
    <div>
      <p>Add your own hilarious joke</p>
      <form method="post">
        <div>
          <label>
            Name:
            <input
              type="text"
              name="name"
              defaultValue={actionData?.fields?.name}
              // ! This line surrounds the input with a red border
              aria-invalid={Boolean(actionData?.fieldErrors?.name)}
              // ! This line tells the screen reader where to find the error message
              aria-errormessage={actionData?.fieldErrors?.name ? "name-error" : undefined}
            />
          </label>
          {/* This is the little area underneath the text box that will have the error message */}
          {actionData?.fieldErrors?.name ? (
            <p className="form-validation-error" id="name-error" role="alert">
              {actionData.fieldErrors.name}
            </p>
          ) : null}
        </div>
        <div>
          <label>
            Content:{" "}
            <textarea
              name="content"
              defaultValue={actionData?.fields?.content}
              aria-invalid={Boolean(actionData?.fieldErrors?.content)}
              aria-errormessage={actionData?.fieldErrors?.content ? "content-error" : undefined}
            />
          </label>
          {actionData?.fieldErrors?.content ? (
            <p className="form-validation-error" id="content-error" role="alert">
              {actionData.fieldErrors.content}
            </p>
          ) : null}
        </div>
        <div>
          {/* This is the formError... Not the fieldError */}
          {actionData?.formError ? (
            <p className="form-validation-error" role="alert">
              {actionData.formError}
            </p>
          ) : null}
          <button type="submit" className="button">
            Add
          </button>
        </div>
      </form>
    </div>
  );
}

