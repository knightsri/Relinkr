import React, { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";
import { signOut } from "next-auth/react";
import { ToastContainer, useToast } from "../components/Toast";
import ThemeSwitcher from "../components/ThemeSwitcher";

type User = {
  name?: string;
  email?: string;
  image?: string;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  const bypass = process.env.DISABLE_AUTH === '1' || (
    process.env.NODE_ENV !== 'production' && (
      context.query.preview === '1' ||
      (Array.isArray(context.query.preview) && context.query.preview.includes('1')) ||
      context.query.bypass === '1' ||
      (Array.isArray(context.query.bypass) && context.query.bypass.includes('1')) ||
      process.env.NEXT_PUBLIC_ALLOW_DESIGN_PREVIEW === '1'
    )
  );

  if (!session) {
    if (bypass) {
      return { props: { user: { name: 'Anonymous', email: 'anon@example.com' } } } as any;
    }
    return { redirect: { destination: "/signin", permanent: false } };
  }

  return { props: { user: session.user } };
};

type LinkEntry = {
  slug: string;
  longUrl: string;
  internalId: string;
  ownerId: string;
};

export default function Home({ user }: { user: User }) {
  // Toast notifications
  const { toasts, removeToast, showSuccess, showError, showInfo } = useToast();
  
  // Get highlight duration from environment variable with validation (1-5 seconds, default 1)
  const getHighlightDuration = () => {
    const envDuration = process.env.NEXT_PUBLIC_HIGHLIGHT_DURATION;
    const duration = envDuration ? parseInt(envDuration, 10) : 1;
    // Validate range: 1-5 seconds, default to 1 if invalid
    return (duration >= 1 && duration <= 5) ? duration * 1000 : 1000; // Convert to milliseconds
  };
  const highlightDuration = getHighlightDuration();
  
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
  // State for edit
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState("");
  // State for analytics
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({});
  // State for sorting
  const [sortField, setSortField] = useState<'slug' | 'longUrl' | 'clicks' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  // State for highlighting newly created and updated links
  const [highlightedLinkId, setHighlightedLinkId] = useState<string | null>(null);
  const [updatedLinkId, setUpdatedLinkId] = useState<string | null>(null);

  // Fetch paginated/search results
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    
    // Build query parameters
    const params = new URLSearchParams({
      q: search,
      page: page.toString(),
      perPage: perPage.toString(),
    });
    
    // Add sorting parameters if they exist
    if (sortField && sortDirection) {
      params.append('sortField', sortField);
      params.append('sortDirection', sortDirection);
    }
    
    fetch(`/api/links/list?${params.toString()}`)
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
  }, [search, page, perPage, sortField, sortDirection]);

  // Fetch analytics for current links
  useEffect(() => {
    if (links.length > 0) {
      const slugs = links.map(link => link.slug);
      const slugParams = slugs.map(slug => `slugs=${encodeURIComponent(slug)}`).join('&');
      
      fetch(`/api/analytics/counts?${slugParams}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.clickCounts) {
            setClickCounts(data.clickCounts);
          }
        })
        .catch(() => {
          // Silently fail, analytics are not critical
        });
    }
  }, [links]);

  // Auto-refresh analytics every 30 seconds
  useEffect(() => {
    if (links.length === 0) return;

    const interval = setInterval(() => {
      const slugs = links.map(link => link.slug);
      const slugParams = slugs.map(slug => `slugs=${encodeURIComponent(slug)}`).join('&');
      
      fetch(`/api/analytics/counts?${slugParams}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.clickCounts) {
            setClickCounts(data.clickCounts);
          }
        })
        .catch(() => {
          // Silently fail
        });
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [links]);

  const totalPages = Math.ceil(total / perPage) || 1;

  // Sorting function
  function handleSort(field: 'slug' | 'longUrl' | 'clicks') {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, start with ascending
      setSortField(field);
      setSortDirection('asc');
    }
  }

  // Get sort indicator
  function getSortIndicator(field: 'slug' | 'longUrl' | 'clicks') {
    if (sortField !== field) return ' ↕️';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  }

  // Create new link
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    showInfo("Creating link...");
    const res = await fetch("/api/links/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ longUrl, customSlug }),
    });
    const data = await res.json();
    if (res.ok) {
      showSuccess("Link created successfully!");
      setLongUrl("");
      setCustomSlug("");
      
      // Reset to show all links (clear search), default sorting (newest first), and go to page 1
      setSearch("");
      setSortField(null);
      setSortDirection('asc');
      setPage(1);
      
      // Refresh the data with default sorting and no search filter
      const refreshParams = new URLSearchParams({
        q: '',
        page: '1',
        perPage: perPage.toString(),
      });
      
      fetch(`/api/links/list?${refreshParams.toString()}`)
        .then((res) => res.json())
        .then((data) => {
          setLinks(data.links || []);
          setTotal(data.total || 0);
          
          // Highlight the newly created link (it should be the first one since we reset sorting)
          if (data.links && data.links.length > 0) {
            setHighlightedLinkId(data.links[0].internalId);
            // Clear highlight after configured duration
            setTimeout(() => {
              setHighlightedLinkId(null);
            }, highlightDuration);
          }
        })
        .catch(() => {
          // If refresh fails, just prepend the new link (fallback)
          setLinks([data, ...links].slice(0, perPage));
          // Highlight the newly created link
          setHighlightedLinkId(data.internalId);
          setTimeout(() => {
            setHighlightedLinkId(null);
          }, highlightDuration);
        });
    } else {
      showError(data.error || "Failed to create link");
    }
  }

  // Edit logic
  function startEdit(link: LinkEntry) {
    setEditSlug(link.slug);
    setEditUrl(link.longUrl);
  }
  
  async function saveEdit(internalId: string) {
    showInfo("Updating link...");
    const res = await fetch("/api/links/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ internalId, longUrl: editUrl }),
    });
    const data = await res.json();
    if (res.ok) {
      showSuccess("Link updated successfully!");
      setLinks(
        links.map((l) =>
          l.internalId === internalId ? { ...l, longUrl: editUrl } : l
        )
      );
      setEditSlug(null);
      setEditUrl("");
      
      // Highlight the updated link with a different color
      setUpdatedLinkId(internalId);
      // Clear highlight after configured duration
      setTimeout(() => {
        setUpdatedLinkId(null);
      }, highlightDuration);
    } else {
      showError(data.error || "Failed to update link");
    }
  }
  
  // Delete logic
  async function handleDelete(internalId: string) {
    if (!window.confirm("Delete this link?")) return;
    showInfo("Deleting link...");
    const res = await fetch("/api/links/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ internalId }),
    });
    const data = await res.json();
    if (res.ok) {
      showSuccess("Link deleted successfully!");
      
      // Calculate if we need to go to previous page
      const remainingLinksOnCurrentPage = links.length - 1;
      const shouldGoToPreviousPage = remainingLinksOnCurrentPage === 0 && page > 1;
      
      // Update page if necessary
      if (shouldGoToPreviousPage) {
        setPage(page - 1);
      }
      
      // Refresh the data to get the correct page content
      const refreshParams = new URLSearchParams({
        q: search,
        page: shouldGoToPreviousPage ? (page - 1).toString() : page.toString(),
        perPage: perPage.toString(),
      });
      
      // Add sorting parameters if they exist
      if (sortField && sortDirection) {
        refreshParams.append('sortField', sortField);
        refreshParams.append('sortDirection', sortDirection);
      }
      
      fetch(`/api/links/list?${refreshParams.toString()}`)
        .then((res) => res.json())
        .then((data) => {
          setLinks(data.links || []);
          setTotal(data.total || 0);
        })
        .catch(() => {
          // If refresh fails, just remove the deleted link (fallback)
          setLinks(links.filter((l) => l.internalId !== internalId));
        });
    } else {
      showError(data.error || "Failed to delete link");
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
      .then(() => showSuccess("Link copied to clipboard!"))
      .catch(() => showError("Failed to copy link"));
  }

  // Render
  return (
    <>
      <main>
        <div className="dashboard-card">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1 className="app-title">Relinkr</h1>
            <h2 className="welcome-title">Welcome, {user?.name || user?.email}!</h2>
            <div className="user-meta">
              {user?.email && <span>Email: {user.email}</span>}
              {user?.image && (
                <img className="user-avatar" src={user.image} alt="Profile" />
              )}
            </div>
          </div>
          <div className="header-actions">
            <ThemeSwitcher />
            <button className="signout-button" onClick={() => signOut()}>
              Sign Out
            </button>
          </div>
        </div>

        <section className="controls-section">
        {/* Create new link */}
        <form onSubmit={handleCreate} className="form-row">
          <b>Create New Short Link</b>
          <div className="form-inline">
            <input
              type="url"
              required
              placeholder="Destination URL (must start with https://)"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              className="url-input"
            />
            <input
              type="text"
              placeholder="Custom slug (optional)"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
              className="slug-input"
            />
            <button type="submit">Create</button>
          </div>
        </form>

        {/* Search and page size */}
        <div className="toolbar">
          <span>
            <b>Search</b>: {" "}
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Matches slug or URL"
              className="search-input"
            />
          </span>
          Rows per page:{" "}
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(parseInt(e.target.value, 10));
              setPage(1);
            }}
            className="rows-select"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        </section>

        {/* Table */}
        <section className="table-section">
          <div className="table-wrapper">
            <table className="links-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => handleSort('slug')} title="Click to sort by Slug">
                Slug{getSortIndicator('slug')}
              </th>
              <th className="sortable" onClick={() => handleSort('longUrl')} title="Click to sort by Destination URL">
                Destination URL{getSortIndicator('longUrl')}
              </th>
              <th className="sortable" onClick={() => handleSort('clicks')} title="Click to sort by Click Count">
                Analytics{getSortIndicator('clicks')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {links.length === 0 ? (
              <tr>
                <td colSpan={4} className="center-cell">
                  No links found.
                </td>
              </tr>
            ) : (
              links.map((link) => (
                <tr
                  key={link.internalId}
                  className={`${highlightedLinkId === link.internalId ? 'row-highlight-new' : updatedLinkId === link.internalId ? 'row-highlight-updated' : ''} ${(highlightedLinkId === link.internalId || updatedLinkId === link.internalId) ? 'pulse' : ''}`}
                >
                  <td>
                    <div className="slug-name">{link.slug}</div>
                    <button type="button" className="copy-link" onClick={() => doCopy(link.slug)}>
                      Copy link
                    </button>
                  </td>
                  <td>
                    {editSlug === link.slug ? (
                      <input value={editUrl} onChange={(e) => setEditUrl(e.target.value)} className="edit-input" />
                    ) : (
                      link.longUrl
                    )}
                  </td>
                  <td className="center-cell">
                    <span className="small-text">
                      Clicks: <strong>{clickCounts[link.slug] || 0}</strong>
                    </span>
                  </td>
                  <td>
                    {editSlug === link.slug ? (
                      <>
                        <button onClick={() => saveEdit(link.internalId)} className="action-button">
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
                        <button onClick={() => startEdit(link)} className="action-button">
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
          </div>
        </section>

        {/* Pagination */}
        <section className="pagination-section">
        <div className="pagination">
          <span className="page-info">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="pager-link btn-prev-gap">
            Prev
          </button>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="pager-link">
            Next
          </button>
        </div>
        </section>
        {loading && <div>Loading...</div>}
        
        {/* Toast Container */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
      </main>
    </>
  );
}
