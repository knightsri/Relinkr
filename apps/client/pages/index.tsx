import React, { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return { redirect: { destination: "/api/auth/signin", permanent: false } };
  }

  return { props: { user: session.user } };
};

type LinkEntry = {
  slug: string;
  longUrl: string;
  internalId: string;
  ownerId: string;
};

export default function Home({ user }: { user: any }) {
  // State for creation
  const [longUrl, setLongUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  // State for dashboard
  const [links, setLinks] = useState<LinkEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  // State for edit
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState("");

  // Fetch paginated/search results
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(
      `/api/links/list?q=${encodeURIComponent(search)}&page=${page}&perPage=${perPage}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (mounted) {
          setLinks(data.links || []);
          setTotal(data.total || 0);
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, [search, page, perPage]);

  const totalPages = Math.ceil(total / perPage) || 1;

  // Create new link
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Creating...");
    const res = await fetch("/api/links/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ longUrl, customSlug }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus("Link created!");
      setLinks([data, ...links]);
      setLongUrl("");
      setCustomSlug("");
    } else {
      setStatus(data.error || "Failed to create link");
    }
  }

  // Edit logic
  function startEdit(link: LinkEntry) {
    setEditSlug(link.slug);
    setEditUrl(link.longUrl);
  }
  async function saveEdit(internalId: string) {
    setStatus("Updating...");
    const res = await fetch("/api/links/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ internalId, longUrl: editUrl }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus("Updated!");
      setLinks(
        links.map((l) =>
          l.internalId === internalId ? { ...l, longUrl: editUrl } : l
        )
      );
      setEditSlug(null);
      setEditUrl("");
    } else {
      setStatus(data.error || "Failed to update");
    }
  }
  // Delete logic
  async function handleDelete(internalId: string) {
    if (!window.confirm("Delete this link?")) return;
    setStatus("Deleting...");
    const res = await fetch("/api/links/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ internalId }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus("Deleted!");
      setLinks(links.filter((l) => l.internalId !== internalId));
    } else {
      setStatus(data.error || "Failed to delete");
    }
  }
  // Copy to clipboard
  function doCopy(slug: string) {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    navigator.clipboard
      .writeText(`${baseUrl}/${slug}`)
      .then(() => setStatus("Copied!"))
      .catch(() => setStatus("Copy failed!"));
  }

  // Render
  return (
    <main style={{ maxWidth: 850, margin: "auto", padding: 30 }}>
      <h2>Welcome, {user?.name || user?.email || user?.id}!</h2>

      {/* Create new link */}
      <form onSubmit={handleCreate} style={{ margin: "18px 0 8px 0" }}>
        <b>Create New Short Link</b>
        <div>
          <input
            type="url"
            required
            placeholder="Destination URL (must start with https://)"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            style={{ width: "56%", marginRight: 8 }}
          />
          <input
            type="text"
            placeholder="Custom slug (optional)"
            value={customSlug}
            onChange={(e) => setCustomSlug(e.target.value)}
            style={{ width: 160, marginRight: 8 }}
          />
          <button type="submit">Create</button>
        </div>
      </form>

      {/* Search and page size */}
      <div style={{ margin: "14px 0 3px 0" }}>
        <span>
          <b>Search</b>:{" "}
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Matches slug or URL"
            style={{
              width: "36%",
              marginRight: 10,
              padding: 7,
              border: "1px solid #888",
              borderRadius: 3,
            }}
          />
        </span>
        Rows per page:{" "}
        <select
          value={perPage}
          onChange={(e) => {
            setPerPage(parseInt(e.target.value, 10));
            setPage(1);
          }}
          style={{ marginLeft: 6 }}
        >
          {[5, 10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        {status && (
          <span style={{ marginLeft: 12, color: "#098" }}>{status}</span>
        )}
      </div>
      {/* Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          margin: "12px 0",
          background: "#fff",
        }}
      >
        <thead>
          <tr style={{ background: "#eef", fontWeight: 600 }}>
            <th style={{ padding: "8px 2px" }}>Slug</th>
            <th style={{ padding: "8px 2px" }}>Destination URL</th>
            <th style={{ padding: "8px 2px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {links.length === 0 ? (
            <tr>
              <td colSpan={3} style={{ textAlign: "center" }}>
                No links found.
              </td>
            </tr>
          ) : (
            links.map((link) => (
              <tr key={link.internalId}>
                <td>
                  <div style={{ fontWeight: 600 }}>{link.slug}</div>
                  <button
                    type="button"
                    style={{
                      fontSize: "0.9em",
                      color: "#06f",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      padding: 0,
                      marginTop: 2,
                    }}
                    onClick={() => doCopy(link.slug)}
                  >
                    Copy link
                  </button>
                </td>
                <td>
                  {editSlug === link.slug ? (
                    <input
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      style={{ width: "90%" }}
                    />
                  ) : (
                    link.longUrl
                  )}
                </td>
                <td>
                  {editSlug === link.slug ? (
                    <>
                      <button
                        onClick={() => saveEdit(link.internalId)}
                        style={{ marginRight: 7 }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditSlug(null);
                          setEditUrl("");
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(link)}
                        style={{ marginRight: 7 }}
                      >
                        Edit
                      </button>
                      <button onClick={() => handleDelete(link.internalId)}>
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* Pagination */}
      <div style={{ marginTop: 14 }}>
        Page {page} of {totalPages}
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          style={{ marginLeft: 12, marginRight: 6 }}
        >
          Prev
        </button>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
      {loading && <div>Loading...</div>}
    </main>
  );
}
// This is the main dashboard page for authenticated users to create, view, edit, and delete their short links.