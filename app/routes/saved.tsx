import { Link } from "react-router";
import type { Route } from "./+types/saved";
import { db } from "~/db";
import { people } from "~/modules/permissions/person.server";
import { listBookmarks } from "~/lib/bookmarks.server";
import { listNotesPage } from "~/modules/notes/index.server";
import { z } from "zod";
import { Card, CardContent } from "~/components/ui/card";
import { Bookmark, NotebookPen } from "lucide-react";
import { formatRelativeTime } from "~/lib/utils";

export function meta() {
  return [
    { title: "Saved — Cadence" },
    { name: "description", content: "Your bookmarks and notes" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const { id: userId } = await people.requirePerson(request);

  const page = z.coerce
    .number()
    .int()
    .min(1)
    .max(100000)
    .catch(1)
    .parse(new URL(request.url).searchParams.get("notesPage") ?? 1);
  return {
    page,
    ...(await listNotesPage(db, userId, page)),
    savedBookmarks: listBookmarks(db, userId),
  };
}

export default function Saved({ loaderData }: Route.ComponentProps) {
  const { savedBookmarks, savedNotes, page, hasMoreNotes } = loaderData;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Saved</h1>
        <p className="text-sm text-muted-foreground">
          The lessons you flagged, and what you wrote about them.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <Bookmark className="size-4 text-muted-foreground" />
            Bookmarks
          </h2>

          {savedBookmarks.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No bookmarks yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {savedBookmarks.map((bookmark) => (
                <SavedLessonCard key={bookmark.id} lesson={bookmark.lesson} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <NotebookPen className="size-4 text-muted-foreground" />
            Notes
          </h2>

          {savedNotes.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No notes yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {savedNotes.map((note) => (
                <SavedLessonCard key={note.id} lesson={note.lesson}>
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none break-words"
                    // oxlint-disable-next-line react/no-danger -- renderNote escapes untrusted HTML
                    dangerouslySetInnerHTML={{ __html: note.html }}
                  />
                  <p
                    suppressHydrationWarning
                    className="text-xs text-muted-foreground"
                  >
                    Edited {formatRelativeTime(note.updatedAt)}
                  </p>
                </SavedLessonCard>
              ))}
            </div>
          )}
          <nav aria-label="Notes pages" className="mt-3 flex gap-4 text-sm">
            {page > 1 && (
              <Link to={`?notesPage=${page - 1}`} className="underline">
                Previous notes
              </Link>
            )}
            {hasMoreNotes && (
              <Link to={`?notesPage=${page + 1}`} className="underline">
                Next notes
              </Link>
            )}
          </nav>
        </section>
      </div>
    </div>
  );
}

type SavedLesson =
  Route.ComponentProps["loaderData"]["savedBookmarks"][number]["lesson"];

/** A row on the Saved page: a link to the Lesson, named with its Course. */
function SavedLessonCard({
  lesson,
  children,
}: {
  lesson: SavedLesson;
  children?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="space-y-1 py-3">
        <Link
          to={`/courses/${lesson.courseSlug}/lessons/${lesson.id}`}
          className="text-sm font-medium hover:underline"
        >
          {lesson.title}
        </Link>
        <p className="text-xs text-muted-foreground">{lesson.courseTitle}</p>
        {children}
      </CardContent>
    </Card>
  );
}
