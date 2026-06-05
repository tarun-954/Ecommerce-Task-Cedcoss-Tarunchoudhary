import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getReviewsServerFn, createReviewServerFn } from "@/lib/api/reviews.server";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Customer Detail Dashboard - Brooklyn Simmons" },
      {
        name: "description",
        content: "Customer detail dashboard with reviews, ratings and AI analysis.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: CustomerDetailPage,
});

const BRAND = "#ff6b00";
const BROOKLYN_AVATAR = new URL("../assets/user.jpeg", import.meta.url).href;

function Star({ className = "w-5 h-5", filled = true }: { className?: string; filled?: boolean }) {
  return (
    <svg
      className={`${className} ${filled ? "text-yellow-400" : "text-gray-200"} fill-current`}
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.46１a１ １ ０ ００．９５１－．６９ｌ１．０７－３．２９２ｚ" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function CustomerDetailPage() {
  type ReviewImage = { url: string; uploadedAt: string };
  type Review = {
    _id?: string;
    id?: string;
    order: string;
    stars: number;
    published: boolean;
    item: string;
    text: string;
    author: string;
    avatar?: string;
    images?: ReviewImage[];
    customerId: string;
    createdAt?: string;
  };

  const FALLBACK_AVATAR =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBFCvwytqibzlFdHubko_JJGsym03sxWXWb24dOH0Y1s9a6lzcEuw_mFF34PWk-Wj7Sp5J9ZS5V2nClJpQmo6-fgLeLzzNgRoSU3A3toDUooTI9ETmsXA7NbsLDzIEGMCL0cw0igSBb_ovd1U5PlQOrwqtzvlExeKKkXvN_T7bsgEu7Pf5s6KVfuHv9AfT-J5ryp8y6lJ9zi9a4SS1nEqklBeAPZfG7FiRjnBGbMVEG-G_JJtpgv88SqTaG9h2d3La7W4jNr56jlwo";

  const customerId = "customer-56578"; // In real app, get from auth context
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({
    order: "",
    item: "",
    text: "",
    stars: 5,
    publish: true,
    author: "",
    avatar: "",
    images: [] as string[],
  });
  const [hoverStar, setHoverStar] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("Review");
  const phState = usePurchaseHistoryState();
  const [debugEvents, setDebugEvents] = useState<
    Array<{ id: string; time: string; label: string; detail: string }>
  >([]);

  const addDebugEvent = (label: string, payload?: unknown) => {
    const detail =
      payload == null
        ? ""
        : typeof payload === "string"
          ? payload
          : JSON.stringify(payload, null, 2);

    console.log(`[reviews-ui] ${label}`, payload ?? "");
    setDebugEvents((events) =>
      [
        {
          id: crypto.randomUUID(),
          time: new Date().toLocaleTimeString(),
          label,
          detail,
        },
        ...events,
      ].slice(0, 8),
    );
  };

  // Fetch reviews from backend
  const { data: reviewsData, refetch: refetchReviews } = useQuery({
    queryKey: ["reviews", customerId],
    queryFn: async () => {
      addDebugEvent("fetch:start", { customerId });
      const result = await getReviewsServerFn({ data: customerId });
      addDebugEvent(result.success ? "fetch:success" : "fetch:error", result);
      return result.success ? result.data : [];
    },
    initialData: [],
  });

  const reviews = Array.isArray(reviewsData) ? reviewsData : [];

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: async (newReview: Omit<Review, "_id" | "customerId">) => {
      addDebugEvent("create:start", {
        customerId,
        item: newReview.item,
        imageCount: newReview.images?.length ?? 0,
      });
      const result = await createReviewServerFn({
        data: {
          ...newReview,
          customerId,
        },
      });
      addDebugEvent(result.success ? "create:success" : "create:error", result);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: async () => {
      const refetchResult = await refetchReviews();
      addDebugEvent("fetch:after-create", {
        status: refetchResult.status,
        count: Array.isArray(refetchResult.data) ? refetchResult.data.length : 0,
      });
      setDraft({
        order: "",
        item: "",
        text: "",
        stars: 5,
        publish: true,
        author: "",
        avatar: "",
        images: [],
      });
      setShowForm(false);
    },
    onError: (error) => {
      addDebugEvent("create:client-error", error instanceof Error ? error.message : error);
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setDraft((d) => ({ ...d, avatar: String(reader.result || "") }));
    reader.readAsDataURL(file);
  };

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const imageData = String(reader.result || "");
      setDraft((d) => ({ ...d, images: [...d.images, imageData] }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (index: number) => {
    setDraft((d) => ({
      ...d,
      images: d.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const order = draft.order.trim() || `Order-${Math.floor(10000 + Math.random() * 89999)}`;
    const item = draft.item.trim();
    const text = draft.text.trim();
    const author = draft.author.trim() || "Anonymous";
    if (!item || !text) {
      addDebugEvent("submit:blocked", "Item and review text are required.");
      return;
    }

    await createReviewMutation.mutateAsync({
      order,
      item,
      text,
      stars: draft.stars,
      published: draft.publish,
      author,
      avatar: draft.avatar || FALLBACK_AVATAR,
      images: draft.images.map((url) => ({
        url,
        uploadedAt: new Date().toISOString(),
      })),
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div
      className="min-h-screen bg-gray-100 p-4"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <style>{`
        .ai-card-gradient { background: linear-gradient(90deg, #f5f3ff 0%, #faebff 100%); }
      `}</style>
      <div
        className="mx-auto flex bg-white overflow-hidden"
        style={{
          maxWidth: 1440,
          borderRadius: 24,
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.1)",
          minHeight: 900,
        }}
      >
        {/* Left sidebar */}
        <aside className="w-16 flex-none border-r border-gray-100 flex flex-col items-center py-6 space-y-8 bg-white">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: BRAND }}
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
            </svg>
          </div>
          <button
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: BRAND }}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 4v16m8-8H4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </button>
          <nav className="flex flex-col space-y-4">
            {[
              "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
              "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
              "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
              "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
            ].map((d, i) => (
              <a
                key={i}
                href="#"
                className="p-2 text-gray-400 hover:text-[color:var(--brand)]"
                style={{ ["--brand" as never]: BRAND }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d={d} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </a>
            ))}
            <a href="#" className="p-2 rounded-lg bg-gray-50" style={{ color: BRAND }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </a>
          </nav>
          <div className="mt-auto flex flex-col space-y-4 pb-4">
            <button className="p-2 text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
                <path
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {/* Top nav */}
          <header className="h-16 flex items-center justify-between px-8 border-b border-gray-100 flex-none">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-900 font-semibold">SoundHub</span>
              <svg
                className="w-4 h-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <span className="text-gray-400">People</span>
            </div>
            <div className="flex-1 max-w-xl px-8">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </span>
                <input
                  className="block w-full pl-10 pr-3 py-2 border-0 bg-gray-50 rounded-lg text-sm focus:bg-white outline-none"
                  placeholder="Search or Press '/' for commands"
                  type="text"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 border-2 border-white" />
              </button>
              <button className="p-2 text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </button>
              <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-xs text-white font-bold">
                FIK
              </div>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
            <main className="flex-1 overflow-y-auto p-8">
              {/* Profile Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-6">
                  <button className="p-2 border border-gray-100 rounded-lg hover:bg-gray-50">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M15 19l-7-7 7-7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                  </button>
                  <img
                    alt="Brooklyn Simmons"
                    className="w-20 h-20 rounded-full object-cover"
                    src={BROOKLYN_AVATAR}
                  />
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Tarun Choudhary</h1>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
                        Active
                      </span>
                      <span className="text-sm text-gray-500">Customer ID #56578</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                    <span>Send Message</span>
                  </button>
                  <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                    <button className="px-2 py-2 hover:bg-gray-50 border-r border-gray-200">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <button className="px-2 py-2 hover:bg-gray-50">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-100 mb-8">
                <nav className="flex space-x-8">
                  {[
                    "Purchase History",
                    "Wishlist",
                    "Review",
                    "Loyalty Program",
                    "Support ticket",
                    "Insight",
                    "Activity",
                  ].map((t) => {
                    const active = t === activeTab;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setActiveTab(t)}
                        className={`pb-4 px-1 text-sm ${active ? "font-bold" : "font-medium text-gray-500 hover:text-gray-700"}`}
                        style={
                          active ? { color: BRAND, borderBottom: `2px solid ${BRAND}` } : undefined
                        }
                      >
                        {t}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {activeTab === "Purchase History" && <PurchaseHistoryMain state={phState} />}
              {activeTab !== "Purchase History" && (
                <>
                  {/* AI Card */}
                  <div className="ai-card-gradient rounded-xl p-6 flex items-start space-x-6 border border-purple-50 mb-10">
                    <div className="bg-white/50 p-4 rounded-lg flex flex-col items-center">
                      <div className="text-purple-600 mb-1">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7.5 5.6L10 7 8.6 4.5 10 2 7.5 3.4 5 2l1.4 2.5L5 7zm12 9.8L17 14l1.4 2.5L17 19l2.5-1.4L22 19l-1.4-2.5L22 14zM22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5zm-7.63 5.29c-.39-.39-1.02-.39-1.41 0L1.29 18.96c-.39.39-.39 1.02 0 1.41l2.34 2.34c.39.39 1.02.39 1.41 0L16.7 11.05c.39-.39.39-1.02 0-1.41l-2.33-2.35zm-1.03 5.49l-2.33-2.33 2.15-2.15 2.33 2.33-2.15 2.15z" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-bold text-purple-700 text-center leading-tight">
                        AI Review
                        <br />
                        Analysis
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg">Customer are satisfied</h3>
                      <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                        The customer was satisfied with the product, noting its quality, durability,
                        and quick, helpful support.
                      </p>
                    </div>
                    <div className="relative">
                      <div className="bg-white/80 p-3 rounded-xl shadow-sm">
                        <svg
                          className="w-8 h-8 text-purple-500"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z" />
                        </svg>
                      </div>
                      <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5">
                        <svg
                          className="w-4 h-4"
                          style={{ color: BRAND }}
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Reviews filter */}
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="relative w-64">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </span>
                      <input
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white outline-none"
                        placeholder="Search"
                      />
                    </div>
                    <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium flex items-center space-x-2 hover:bg-gray-50">
                      <span>Duration</span>
                      <ChevronDown />
                    </button>
                    <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium flex items-center space-x-2 hover:bg-gray-50">
                      <span>Channels</span>
                      <ChevronDown />
                    </button>
                    <button
                      onClick={() => setShowForm((v) => !v)}
                      className="ml-auto px-4 py-2 rounded-lg text-sm font-semibold text-white flex items-center space-x-2 hover:opacity-90"
                      style={{ backgroundColor: BRAND }}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span>{showForm ? "Cancel" : "Add Review"}</span>
                    </button>
                  </div>

                  {showForm && (
                    <form
                      onSubmit={handleSubmit}
                      className="mb-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-gray-900">Write a review</h3>
                        <div
                          className="flex items-center space-x-1"
                          onMouseLeave={() => setHoverStar(0)}
                        >
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onMouseEnter={() => setHoverStar(n)}
                              onClick={() => setDraft((d) => ({ ...d, stars: n }))}
                              className="p-0.5"
                              aria-label={`${n} star${n > 1 ? "s" : ""}`}
                            >
                              <Star className="w-6 h-6" filled={n <= (hoverStar || draft.stars)} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <label className="cursor-pointer relative shrink-0">
                          <div
                            className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden text-gray-400 hover:border-gray-400"
                            style={
                              draft.avatar
                                ? {
                                    backgroundImage: `url(${draft.avatar})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    borderStyle: "solid",
                                  }
                                : undefined
                            }
                          >
                            {!draft.avatar && (
                              <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                          />
                        </label>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            value={draft.author}
                            onChange={(e) => setDraft((d) => ({ ...d, author: e.target.value }))}
                            placeholder="Your name"
                            maxLength={60}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white outline-none"
                          />
                          <input
                            value={draft.order}
                            onChange={(e) => setDraft((d) => ({ ...d, order: e.target.value }))}
                            placeholder="Order # (optional)"
                            maxLength={40}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white outline-none"
                          />
                        </div>
                      </div>
                      <input
                        value={draft.item}
                        onChange={(e) => setDraft((d) => ({ ...d, item: e.target.value }))}
                        placeholder="Product name"
                        required
                        maxLength={120}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white outline-none"
                      />
                      <textarea
                        value={draft.text}
                        onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
                        placeholder="Share your experience..."
                        required
                        maxLength={1000}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white outline-none resize-none"
                      />

                      {/* Review Images Upload Section */}
                      <div className="border-t border-gray-200 pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Add photos to your review
                        </label>
                        <label className="cursor-pointer block">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition">
                            <svg
                              className="w-8 h-8 text-gray-400 mx-auto mb-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <p className="text-sm text-gray-600">Click to upload product photos</p>
                            <p className="text-xs text-gray-500 mt-1">
                              JPG, PNG, WebP or GIF (max 5MB each)
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAddImage}
                            multiple
                          />
                        </label>

                        {/* Preview uploaded images */}
                        {draft.images.length > 0 && (
                          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                            {draft.images.map((image, idx) => (
                              <div key={idx} className="relative group">
                                <img
                                  src={image}
                                  alt={`Preview ${idx + 1}`}
                                  className="w-full h-20 object-cover rounded-lg border border-gray-200"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(idx)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                        <label className="flex items-center space-x-2 text-sm text-gray-600">
                          <input
                            type="checkbox"
                            checked={draft.publish}
                            onChange={(e) => setDraft((d) => ({ ...d, publish: e.target.checked }))}
                          />
                          <span>Publish immediately</span>
                        </label>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={createReviewMutation.isPending}
                            className="px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                            style={{ backgroundColor: BRAND }}
                          >
                            {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Rating Summary */}
                  <div className="flex items-start space-x-12 mb-10">
                    <div className="flex-none">
                      <span className="text-sm text-gray-500 font-medium">Rating</span>
                      <div className="flex items-baseline space-x-2 mt-2">
                        <span className="text-5xl font-bold text-gray-900">4.8</span>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">92 reviews</p>
                    </div>
                    <div className="flex-1 space-y-2 max-w-sm">
                      {[
                        { label: "5 - Excellent", pct: 80, count: "2,200" },
                        { label: "4 - Good", pct: 20, count: "550" },
                        { label: "3 - Okay", pct: 20, count: "550" },
                      ].map((r) => (
                        <div key={r.label} className="flex items-center text-xs">
                          <span className="w-20 text-gray-500">{r.label}</span>
                          <div className="flex-1 mx-3 relative h-1.5 rounded-full bg-gray-200">
                            <div
                              className="absolute inset-y-0 left-0 rounded-full bg-gray-900"
                              style={{ width: `${r.pct}%` }}
                            />
                          </div>
                          <span className="w-12 text-right font-medium">{r.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wide text-gray-600">
                        Debug
                      </h3>
                      <span className="text-xs font-semibold text-gray-500">
                        {reviews.length} reviews loaded
                      </span>
                    </div>
                    {debugEvents.length === 0 ? (
                      <p className="text-xs text-gray-500">Waiting for fetch activity...</p>
                    ) : (
                      <div className="space-y-2">
                        {debugEvents.map((event) => (
                          <details
                            key={event.id}
                            className="rounded-md border border-gray-200 bg-white px-3 py-2"
                          >
                            <summary className="cursor-pointer text-xs font-semibold text-gray-800">
                              {event.time} - {event.label}
                            </summary>
                            {event.detail && (
                              <pre className="mt-2 max-h-36 overflow-auto whitespace-pre-wrap text-[11px] leading-relaxed text-gray-600">
                                {event.detail}
                              </pre>
                            )}
                          </details>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Review items */}
                  {reviews.map((r) => (
                    <ReviewItem
                      key={r._id || r.id}
                      order={r.order}
                      stars={r.stars}
                      published={r.published}
                      item={r.item}
                      text={r.text}
                      author={r.author}
                      avatar={r.avatar}
                      images={r.images}
                    />
                  ))}
                </>
              )}
            </main>

            {activeTab === "Purchase History" ? (
              <aside className="w-80 flex-none border-l border-gray-100 overflow-y-auto bg-white">
                <PurchaseHistorySidebar state={phState} />
              </aside>
            ) : (
              <aside className="w-80 flex-none border-l border-gray-100 overflow-y-auto bg-white">
                <div className="p-6 border-b border-gray-100">
                  <h4 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b-2 border-black inline-block">
                    Customer Details
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Customer Source</span>
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                        <span className="text-xs font-bold">Online Store</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Last Online</span>
                      <span className="text-xs font-bold">04 Feb 2024, 13:00</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-gray-900">Shipping Address</h4>
                    <button className="text-gray-400">
                      <EditIcon />
                    </button>
                  </div>
                  <div className="relative w-full h-24 bg-gray-100 rounded-lg overflow-hidden mb-4 border border-gray-200">
                    <img
                      className="w-full h-full object-cover opacity-50 grayscale"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQ33Jw6ao5PdT5uFVdR-Ir2R_LQGNXrcMJCT2h7HSJADkRZSLKzeMzeJyNEYAWglalSfhiqam6-feH-k5s-bxT4UssWGQEr7-1hvUCwR52l8sNQfZ0Ef6GUv90PGT2V6G_Gg72LFrv7ky-wbq8rMNcssAOODJ6yDaRbbTtuvZaKhX8PEAoSp9Vg7B7cBEKHJX--ygvW7C23fsi9RvsGqnPDfC2pgVos5TeImK-r8PumwqM3nRGGdgEpFr9fv31FaxOQeAiBOBrxwU"
                      alt="Map"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="w-3 h-3 rounded-full border-2 border-white"
                        style={{ backgroundColor: BRAND, boxShadow: `0 0 0 4px ${BRAND}33` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900">Bagus Fikri</p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        2118 Thornridge Cir. Syracuse,
                        <br />
                        Connecticut 35624
                        <br />
                        United State
                      </p>
                    </div>
                    <a className="text-[10px] font-bold text-gray-900 underline" href="#">
                      View on Map
                    </a>
                  </div>
                </div>

                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-gray-900">Contact Information</h4>
                    <button className="text-gray-400">
                      <EditIcon />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="inline-flex px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-xs font-medium text-blue-700">
                      bagus.fikri@mail.com
                    </div>
                    <div className="block">
                      <div className="inline-flex px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs font-medium text-gray-700">
                        +(22)-789-907
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-gray-900">Contact Information</h4>
                    <button className="text-gray-400">
                      <EditIcon />
                    </button>
                  </div>
                  <div className="inline-flex px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-xs font-medium text-blue-700">
                    Business Owner
                  </div>
                </div>

                <div className="p-6">
                  <h4 className="text-sm font-bold text-gray-900 mb-4">Tags</h4>
                  <div className="h-10 w-full bg-gray-50 rounded-lg border border-dashed border-gray-200" />
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewItem({
  order,
  stars,
  published,
  item,
  text,
  author,
  avatar,
  images = [],
}: {
  order: string;
  stars: number;
  published: boolean;
  item: string;
  text: string;
  author: string;
  avatar: string;
  images?: Array<{ url: string; uploadedAt: string }>;
}) {
  return (
    <div className="border-t border-gray-100 pt-8 pb-12">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={avatar}
            alt={author}
            className="w-10 h-10 rounded-full object-cover border border-gray-100"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900">{author}</span>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="text-xs font-semibold text-gray-500">{order}</span>
              <button className="text-gray-400 hover:text-gray-600">
                <CopyIcon />
              </button>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5" filled={i < stars} />
                ))}
              </div>
            </div>
          </div>
        </div>
        {published ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
            <svg className="w-2.5 h-2.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
            </svg>
            Published
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500">
            <svg className="w-2.5 h-2.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M13.477 3.03a.75.75 0 01.437.695v8.68a.75.75 0 01-1.076.676l-1.872-.936a.75.75 0 00-.67 0l-1.872.936a.75.75 0 01-1.076-.676V3.725a.75.75 0 01.437-.695 38.014 38.014 0 017.692 0zM10 10.75a.75.75 0 100-1.5.75.75 0 000 1.5z"
              />
            </svg>
            Unpublished
          </span>
        )}
      </div>
      <div className="mb-3">
        <span className="text-sm mr-2 font-bold" style={{ color: BRAND }}>
          |
        </span>
        <span className="text-sm text-gray-500 mr-2">Item:</span>
        <a className="text-sm font-semibold underline underline-offset-2" href="#">
          {item}
        </a>
      </div>
      <p className="text-sm text-gray-800 leading-relaxed mb-4">{text}</p>

      {/* Display review images */}
      {images && images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((image, idx) => (
            <div key={idx} className="relative group">
              <img
                src={image.url}
                alt={`Review image ${idx + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-200 hover:border-gray-400 transition"
              />
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 rounded-lg transition" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type PHReview = {
  id: string;
  author: string;
  avatar: string;
  date: string;
  stars: number;
  text: string;
  helpful: number;
};

const PRODUCT_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAlCxKLBjTab1EwQAlE5jPgg-qp-wI7ErlMszlfYayRZ2Fz-83ngk0zczijXKv-f5nAIF6R0pGKmMzI4KNR5-apLEwyoEzPSsemBQymHtv_5lLMN7pqCFpdBSiI34YXkkgoSoZnCld-KfA1G7XjoXsTx56Mp4tczQu7MQEhKOLiH5MipLYkNSwvsRHja6TD1LQsNCmFiq4qUGjPMwftj2INmu_XfD6T_imGfTKUypX6ETWRUxFRqIxqaJy6ardRIbuyOKuRfz8WtVc";
const INITIAL_PH: PHReview[] = [
  {
    id: "p1",
    author: "Brooklyn Simmons",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBYapIpqgelX3gqabM7mfcvduKoAbf_41_Azg0Z2fxbCTc7Vb2Aln1-U2XUVxl4jcWo00ZrDp9lOVnL1gShoFsPKACblO7680jsxUcXBMY31Uu_HLbtg-YpL-i6s59GIiRsABnTnuJIYLBsTO5vZMgMml4FUYwjva2M3hM4thMHoVL6XIkpKqdkacIIloog67VQKfP4nBJLnet0M9-kH-i8BuLPH6S8YpUY8FdZTZpw6O82h_pSosjuQdL8QXQi-FSqNU_1ZOEBkGw",
    date: "Dec 6, 2023",
    stars: 5,
    text: "I recently ordered the Plushie Aya Bunny for my niece's birthday and I must say the quality is exceptional. The \"creamy white\" fur is incredibly soft to the touch and hasn't shed at all after weeks of use. It's exactly as described and the order arrived two days earlier than expected!",
    helpful: 12,
  },
  {
    id: "p2",
    author: "Marcus Weber",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBt4FkELV5iIJaAHRtcVmzAL8C4HdtflefRefJNL6qsehOpdiblFSTbO4_yqQilGDpZThaXdVrTPH9C0HRo9Nbptj4zaVOIP35r5r6LI1cGx3Tg_ZmJ6Oo0U_HKS71BzlacpFrW7ZzlosyEXXDOUlei0zZ2EVO_laobV6e2J9x5sKBzL2gjhr41ZfIUnAgaJIA7_pQ3d8MzVxcsAIB27yZ5Xk5WXAVc85w9XxCfJxk1Nxdnotzl-Q5fbQyW1i3lq5R29LuuHm3wPTw",
    date: "Nov 22, 2023",
    stars: 4,
    text: "Very cute plushie. Only reason for 4 stars is that it's a bit smaller than I anticipated from the photos, but it's still adorable and very well-made. Great gift option for the holidays.",
    helpful: 3,
  },
];

function usePurchaseHistoryState() {
  const [list, setList] = useState<PHReview[]>(INITIAL_PH);
  const [subTab, setSubTab] = useState<"reviews" | "specs" | "qna">("reviews");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [feedback, setFeedback] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!rating || !feedback.trim()) return;
    setList((prev) => [
      {
        id: crypto.randomUUID(),
        author: title.trim() || "You",
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCBllBwZ7-BVscESBM4BwRNfLvqDRS6RDSf09lqTI4K_7pb27ja0Lo5VBg3Oghf5sPBRE-XjuQM4lmXb0yRGUc-ImxFJpX4rRkXz3wsP4w2tTX0fND7Kx7VU5x5fn7goBVfj-G8T4kl85Gsu-SGdgjQX0wtzentXMcB8B-qc_wSJcX5wVRNPYrynFH9c0sN0DXJ24j2_551nPg2P2klA3U3Xu9C3uC8g7TFouMQtXFL6Gft4MLgRRW7H-wytTKePuc4CzELHYVOKAg",
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        stars: rating,
        text: feedback.trim(),
        helpful: 0,
      },
      ...prev,
    ]);
    setRating(0);
    setHover(0);
    setTitle("");
    setFeedback("");
  };

  return {
    list,
    subTab,
    setSubTab,
    rating,
    setRating,
    hover,
    setHover,
    title,
    setTitle,
    feedback,
    setFeedback,
    submit,
  };
}

type PHState = ReturnType<typeof usePurchaseHistoryState>;

function PurchaseHistoryMain({ state }: { state: PHState }) {
  const { list, subTab, setSubTab } = state;
  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
        <a
          className="hover:text-[color:var(--brand)]"
          style={{ ["--brand" as never]: BRAND }}
          href="#"
        >
          Dashboard
        </a>
        <span>/</span>
        <span className="font-semibold text-gray-900">Purchase History</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Order Details</h2>
      <p className="text-sm text-gray-500 mb-6">
        Review your recent purchase and share your experience with the community.
      </p>

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-8">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 bg-[#fff1eb] p-6 flex items-center justify-center">
            <img
              src={PRODUCT_IMG}
              alt="Plushie Aya Bunny"
              className="max-w-full max-h-56 object-contain drop-shadow-xl"
            />
          </div>
          <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="bg-sky-400 text-white px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide mb-2 inline-block">
                  Purchased
                </span>
                <h3 className="text-2xl font-bold" style={{ color: BRAND }}>
                  Plushie Aya Bunny
                </h3>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">$19.00</p>
                <p className="text-xs text-gray-400 line-through">$28.00</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-y-4 mb-6">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500">Color</p>
                <p className="text-sm font-semibold">Creamy White</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500">Order Date</p>
                <p className="text-sm font-semibold">Oct 12, 2023</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500">Order ID</p>
                <p className="text-sm font-semibold">#SaaS-88219</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500">Status</p>
                <p className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Delivered
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                className="text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90"
                style={{ backgroundColor: BRAND }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Write a Review
              </button>
              <button className="border border-gray-300 px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-50">
                Buy Again
              </button>
            </div>
          </div>
        </div>
      </section>

      <nav className="flex gap-8 border-b border-gray-200 mb-6">
        {(
          [
            ["reviews", `Customer Reviews (${1543 + list.length - 2})`],
            ["specs", "Specifications"],
            ["qna", "Support Q&A"],
          ] as const
        ).map(([k, label]) => {
          const active = subTab === k;
          return (
            <button
              key={k}
              onClick={() => setSubTab(k)}
              className={`py-3 px-1 text-sm font-bold ${active ? "" : "text-gray-500 hover:text-gray-700"}`}
              style={active ? { color: BRAND, borderBottom: `2px solid ${BRAND}` } : undefined}
            >
              {label}
            </button>
          );
        })}
      </nav>

      {subTab === "reviews" && (
        <>
          <div className="bg-white/60 backdrop-blur p-4 rounded-xl mb-6 flex items-center gap-4 border border-gray-100 shadow-sm">
            <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l1.9 5.9H20l-4.9 3.6L17 17l-5-3.6L7 17l1.9-5.5L4 7.9h6.1L12 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">AI Review Analysis</p>
              <p className="text-xs text-gray-600">
                "The customer was satisfied with the product, noting its quality, durability, and
                quick, helpful support."
              </p>
            </div>
            <div className="bg-white/80 p-2 rounded-lg border border-gray-200">
              <svg
                className="w-5 h-5"
                style={{ color: BRAND }}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
              </svg>
            </div>
          </div>

          <div className="space-y-4">
            {list.map((r) => (
              <article key={r.id} className="bg-white p-5 rounded-xl border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={r.avatar}
                      alt={r.author}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="text-sm font-bold">{r.author}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex" style={{ color: BRAND }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5" filled={i < r.stars} />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">{r.date}</span>
                      </div>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded">
                    Verified Purchase
                  </span>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed mb-3">{r.text}</p>
                <div className="flex gap-5 text-xs font-bold text-gray-500">
                  <button
                    className="flex items-center gap-1.5 hover:text-[color:var(--brand)]"
                    style={{ ["--brand" as never]: BRAND }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"
                      />
                    </svg>
                    Helpful ({r.helpful})
                  </button>
                  <button
                    className="flex items-center gap-1.5 hover:text-[color:var(--brand)]"
                    style={{ ["--brand" as never]: BRAND }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.8L3 21l1.8-4.5A8.36 8.36 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    Reply
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button className="text-sm font-bold hover:underline" style={{ color: BRAND }}>
              View All 1,543 Reviews
            </button>
          </div>
        </>
      )}

      {subTab === "specs" && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 text-sm text-gray-600">
          Product specifications coming soon.
        </div>
      )}
      {subTab === "qna" && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 text-sm text-gray-600">
          Support Q&amp;A coming soon.
        </div>
      )}
    </div>
  );
}

function PurchaseHistorySidebar({ state }: { state: PHState }) {
  const { rating, setRating, hover, setHover, title, setTitle, feedback, setFeedback, submit } =
    state;
  const bars = [
    { label: "5 Stars", pct: 75 },
    { label: "4 Stars", pct: 15 },
    { label: "3 Stars", pct: 5 },
    { label: "2 Stars", pct: 3 },
    { label: "1 Star", pct: 2 },
  ];
  return (
    <>
      <div className="p-6 border-b border-gray-100">
        <h4 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b-2 border-black inline-block">
          Customer Sentiment
        </h4>
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-bold">4.5</span>
            <div className="flex flex-col">
              <div className="flex" style={{ color: BRAND }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4" filled />
                ))}
                <Star className="w-4 h-4" filled={false} />
              </div>
              <span className="text-xs text-gray-500">Based on 1,543 reviews</span>
            </div>
          </div>
          <div className="space-y-2">
            {bars.map((b) => (
              <div key={b.label} className="flex items-center gap-3">
                <span className="w-14 text-xs font-bold">{b.label}</span>
                <div className="flex-1 h-2 bg-white rounded-full overflow-hidden border border-gray-100">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${b.pct}%`, backgroundColor: BRAND }}
                  />
                </div>
                <span className="w-8 text-right text-xs text-gray-500">{b.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 border-b border-gray-100">
        <h4 className="text-sm font-bold text-gray-900 mb-4">Write a Review</h4>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-[11px] uppercase tracking-wide text-gray-500 block mb-2">
              Select Rating
            </label>
            <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onMouseEnter={() => setHover(n)}
                  onClick={() => setRating(n)}
                  aria-label={`${n} star`}
                >
                  <Star className="w-7 h-7" filled={n <= (hover || rating)} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wide text-gray-500 block mb-1">
              Review Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              maxLength={120}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:bg-white"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wide text-gray-500 block mb-1">
              Your Feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What did you like or dislike?"
              rows={4}
              maxLength={1000}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:bg-white resize-none"
            />
          </div>
          <button
            type="submit"
            className="w-full text-white py-3 rounded-lg text-sm font-bold hover:brightness-110 disabled:opacity-50"
            style={{ backgroundColor: BRAND }}
            disabled={!rating || !feedback.trim()}
          >
            Submit Review
          </button>
        </form>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-bold text-gray-900">Other Purchases</h4>
          <a href="#" className="text-xs font-bold" style={{ color: BRAND }}>
            View All
          </a>
        </div>
        <div className="space-y-2">
          {[
            {
              name: 'MacBook Pro 14" M1 Chip',
              date: "Ordered Dec 20, 2023",
              img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCUw_WKKKXOlKISiAkEugxg1OM76IvAGriYjPFgAoCpZQX1jCkSisFBet--PWMcBkSaaU3AZyyZvWcyg7KYtNaYMMlzHjHzRzaEm57Zu524E84C5jb4m6_HLONYKT7Q-Fsw_2ZCDvwYSWOFT03yYTp8CSEJXWVlE3UlAIPDrPve4oeHPsxNoJ3fArC8xqew5U1KAOkSSy7nGa7d7dSYc6nJu7EkbhrhRFlqycLq-vPE5fNn7myx2xV9xEZylJuYtXHdGK6K1ktfPks",
            },
            {
              name: "Classic Leather Timepiece",
              date: "Ordered Nov 05, 2023",
              img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCsV5xn7Kfr9ik934UtNOUFbbqASAmkpo7JnDVR4yPejeDChFFYXzXKzJ7OJmJ5eZsklN2LHux_eOhETMNc85vWIMGyYtbfL9IP20Ifiu3rkYRYQ_928jxgNOP6JcVZZYwcLdtmQfLprlkEh-6YKY4HwUUvdAYA5DXufWXwruVuPjC-oizGkMhOO81H5SOvBMhIEaX1gy_-VsYykdJGL13l26ODW3Qy35P4TBNpOtVDT2RwZyfAUhKug63T8sJtbv-81r6Eda2pgtY",
            },
          ].map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200"
            >
              <img src={p.img} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold truncate">{p.name}</h4>
                <p className="text-xs text-gray-500">{p.date}</p>
              </div>
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
