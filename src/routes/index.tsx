import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createReviewServerFn,
  deleteReviewServerFn,
  getReviewsServerFn,
  updateReviewServerFn,
} from "@/lib/api/reviews.server";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Customer Detail Dashboard - Tarun Choudhary" },
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
const USER_AVATAR = "https://i.postimg.cc/pVSsv7cK/Whats-App-Image-2026-05-08-at-01-33-44.jpg";
const CUSTOMER_NAME = "Tarun Choudhary";

function resolveAvatarUrl(avatar?: string) {
  if (!avatar) return USER_AVATAR;
  if (avatar.startsWith("data:image/")) return avatar;
  if (avatar.includes("i.postimg.cc")) return USER_AVATAR;
  if (avatar.startsWith("https://") && !avatar.includes("@fs")) return avatar;
  if (avatar.startsWith("http://") && !avatar.includes("@fs") && !avatar.includes("localhost"))
    return avatar;
  return USER_AVATAR;
}

type PurchaseOrder = {
  id: string;
  item: string;
  orderId: string;
  price: string;
  originalPrice?: string;
  color: string;
  orderDate: string;
  image: string;
  status: "Delivered" | "Shipped" | "Processing";
  panelBg: string;
  media:
    | { type: "sketchfab"; title: string; src: string }
    | { type: "image"; src: string; alt: string };
  specs: { label: string; value: string }[];
  qna: { question: string; answer: string }[];
};

const PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: "1",
    item: "SoundHub 7G Black Headphones",
    orderId: "#SaaS-88219",
    price: "₹1,900.00",
    originalPrice: "₹2,280.00",
    color: "Dark Black",
    orderDate: "June 07, 2026",
    image: "https://m.media-amazon.com/images/I/61kFL7ywsZS.jpg",
    status: "Delivered",
    panelBg: "#fffff",
    media: {
      type: "sketchfab",
      title: "SoundHub 7G Black Headphones",
      src:
      "https://sketchfab.com/models/87ddc4f9942b41bab65375ec5895e9c2/embed?autostart=1&autospin=1&preload=1&ui_controls=0&ui_infos=0&ui_stop=0&transparent=1",    },
    specs: [
      { label: "Driver Size", value: "40mm dynamic" },
      { label: "Battery Life", value: "Up to 30 hours" },
      { label: "Connectivity", value: "Bluetooth 5.3, USB-C" },
      { label: "Weight", value: "250g" },
    ],
    qna: [
      {
        question: "Is noise cancellation supported?",
        answer: "Yes, hybrid ANC with ambient mode is included.",
      },
      {
        question: "Can I use these wired?",
        answer: "Yes, a 3.5mm cable is included in the box.",
      },
    ],
  },
  {
    id: "2",
    item: 'SoundHub Extra Base Headphones',
    orderId: "#SaaS-77102",
    price: "₹1,24,900.00",
    color: "Space Black",
    image: "https://m.media-amazon.com/images/I/51F-Ok9xuzL.jpg",
    orderDate: "June 01, 2026",
    status: "Delivered",
    panelBg: "#ffffff",
    media: {
      type: "sketchfab",
      title: "SoundHub 7G Black Headphones",
      src:
      "https://sketchfab.com/models/05735b74d3524f00b648231138122a28/embed?autospin=1&autostart=1&preload=1&transparent=1&ui_theme=dark",    },
    specs: [
      { label: "Driver Size", value: "50mm neodymium" },
      { label: "Battery Life", value: "Up to 45 hours" },
      { label: "Connectivity", value: "Bluetooth 5.4, LDAC" },
      { label: "Weight", value: "320g" },
    ],
    qna: [
      {
        question: "Are these good for studio use?",
        answer: "They offer flat tuning suitable for casual monitoring.",
      },
      {
        question: "Do they fold for travel?",
        answer: "Yes, they include a fold-flat hinge design.",
      },
    ],
  },
 
  {
    id: "3",
    item: "Classic Leather SoundHub Headphones",
    orderId: "#SaaS-65431",
    price: "₹8,499.00",
    originalPrice: "₹9,999.00",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJPy_L-RNnDlmU1MNqhIvx-b5hBEmipkmsfw&s",
    color: "Brown Leather Black",
    orderDate: "May 23, 2026",
    status: "Delivered",
    panelBg: "#ffffff",
    media: {
      type: "sketchfab",
      title: "Samsung Galaxy Buds4 Pro Pink Gold",
     src:
  "https://sketchfab.com/models/a65354bb59af4d358701c91b39012d50/embed?autospin=1&autostart=1&preload=1&transparent=1&ui_theme=dark",
      
    },
    specs: [
      { label: "Material", value: "Genuine leather ear cushions" },
      { label: "Battery Life", value: "Up to 28 hours" },
      { label: "Connectivity", value: "Bluetooth 5.2" },
      { label: "Weight", value: "265g" },
    ],
    qna: [
      {
        question: "Is the leather replaceable?",
        answer: "Yes, replacement ear pads are available from SoundHub.",
      },
      {
        question: "Are they sweat resistant?",
        answer: "They are suitable for light workouts but not fully waterproof.",
      },
    ],
  },
  {
    id: "4",
    item: "SoundHub Pro 3",
    orderId: "#SaaS-65431",
    price: "₹8,499.00",
    originalPrice: "₹9,999.00",
    image: "https://www.flashify.in/cdn/shop/products/61sRKTAfrhL.jpg?v=1733946410&width=2560",
    color: "Cream White",
    orderDate: "Feb 11, 2026",
    status: "Delivered",
    panelBg: "#ffffff",
    media: {
      type: "sketchfab",
      title: "Samsung Galaxy Buds4 Pro Pink Gold",
     src:
  "https://sketchfab.com/models/09e94506c52f416b963eeec023468c82/embed?autospin=1&autostart=1&preload=1&transparent=1&ui_theme=light",
      
    },
    specs: [
      { label: "Driver Size", value: "11mm planar" },
      { label: "Battery Life", value: "Up to 36 hours" },
      { label: "Connectivity", value: "Bluetooth 5.3, multipoint" },
      { label: "Weight", value: "240g" },
    ],
    qna: [
      {
        question: "Do they support fast charging?",
        answer: "Yes, 10 minutes of charging gives about 5 hours of playback.",
      },
      {
        question: "Is there a companion app?",
        answer: "Yes, the SoundHub app offers EQ presets and firmware updates.",
      },
    ],
  },
];

function parseReviewText(text: string) {
  const splitIndex = text.indexOf("\n\n");
  if (splitIndex > 0 && splitIndex <= 120) {
    return {
      title: text.slice(0, splitIndex),
      body: text.slice(splitIndex + 2),
    };
  }
  return { title: null, body: text };
}

function buildReviewText(title: string, feedback: string) {
  const trimmedTitle = title.trim();
  const trimmedFeedback = feedback.trim();
  if (trimmedTitle && trimmedFeedback) {
    return `${trimmedTitle}\n\n${trimmedFeedback}`;
  }
  return trimmedFeedback;
}

function formatReviewDate(createdAt?: string) {
  if (!createdAt) return "";
  return new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildRatingRows(reviewList: { stars: number }[]) {
  const count = reviewList.length;
  return [5, 4, 3, 2, 1].map((stars) => {
    const starCount = reviewList.filter((review) => review.stars === stars).length;
    return {
      label: stars === 1 ? "1 Star" : `${stars} Stars`,
      pct: count === 0 ? 0 : Math.round((starCount / count) * 100),
      count: starCount,
      stars,
    };
  });
}

function Star({ className = "w-5 h-5", filled = true }: { className?: string; filled?: boolean }) {
  return (
    <svg
      className={`${className} ${filled ? "text-yellow-400" : "text-gray-200"} fill-current`}
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
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

type DurationFilter = "all" | "7d" | "30d" | "90d" | "1y";

const DURATION_OPTIONS: { value: DurationFilter; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "1y", label: "Last year" },
];

function matchesTextQuery(fields: (string | undefined)[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((field) => field?.toLowerCase().includes(q));
}

function isWithinDuration(createdAt: string | undefined, duration: DurationFilter) {
  if (duration === "all") return true;
  if (!createdAt) return false;
  const days = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 }[duration];
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return new Date(createdAt).getTime() >= cutoff;
}

function filterPurchaseOrders(orders: PurchaseOrder[], query: string) {
  return orders.filter((order) =>
    matchesTextQuery(
      [order.item, order.orderId, order.color, order.status, order.orderDate, order.price],
      query,
    ),
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

  const FALLBACK_AVATAR = USER_AVATAR;

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
  const [activeTab, setActiveTab] = useState<string>("Purchase History");
  const [productSearch, setProductSearch] = useState("");
  const [reviewSearch, setReviewSearch] = useState("");
  const [durationFilter, setDurationFilter] = useState<DurationFilter>("all");
  const [durationOpen, setDurationOpen] = useState(false);
  const [reviewSubmitError, setReviewSubmitError] = useState<string | null>(null);
  const durationRef = useRef<HTMLDivElement>(null);
  const phState = usePurchaseHistoryFormState();
  const productReviewFormRef = useRef<HTMLDivElement>(null);
  const productDetailsRef = useRef<HTMLDivElement>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(PURCHASE_ORDERS[0]?.id ?? null);
  const [highlightReviewForm, setHighlightReviewForm] = useState(false);
  const selectedOrder =
    PURCHASE_ORDERS.find((order) => order.id === selectedOrderId) ?? null;
  const activeProductItem = selectedOrder?.item ?? PURCHASE_ORDERS[0].item;

  // Fetch reviews from backend
  const { data: reviewsData, refetch: refetchReviews } = useQuery({
    queryKey: ["reviews", customerId],
    queryFn: async () => {
      const result = await getReviewsServerFn({ data: customerId });
      return result.success ? result.data : [];
    },
    initialData: [],
  });

  const reviews = Array.isArray(reviewsData) ? reviewsData : [];
  const filteredPurchaseOrders = filterPurchaseOrders(PURCHASE_ORDERS, productSearch);
  const filteredReviews = reviews.filter(
    (review) =>
      matchesTextQuery([review.author, review.text, review.item, review.order], reviewSearch) &&
      isWithinDuration(review.createdAt, durationFilter),
  );
  const filteredReviewCount = filteredReviews.length;
  const filteredAverageRating =
    filteredReviewCount === 0
      ? "0.0"
      : (
          filteredReviews.reduce((sum, review) => sum + review.stars, 0) / filteredReviewCount
        ).toFixed(1);
  const filteredRatingRows = [5, 4, 3, 2, 1].map((stars) => {
    const count = filteredReviews.filter((review) => review.stars === stars).length;
    return {
      label:
        stars === 5
          ? "5 - Excellent"
          : stars === 4
            ? "4 - Good"
            : stars === 3
              ? "3 - Okay"
              : `${stars} - Poor`,
      pct: filteredReviewCount === 0 ? 0 : Math.round((count / filteredReviewCount) * 100),
      count,
      stars,
    };
  });
  const productReviews = reviews.filter((review) => review.item === activeProductItem);
  const productReviewCount = productReviews.length;
  const productAverageRating =
    productReviewCount === 0
      ? "0.0"
      : (
          productReviews.reduce((sum, review) => sum + review.stars, 0) / productReviewCount
        ).toFixed(1);
  const productRatingRows = buildRatingRows(productReviews);

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: async (newReview: Omit<Review, "_id" | "customerId">) => {
      const result = await createReviewServerFn({
        data: {
          ...newReview,
          customerId,
        },
      });
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: async () => {
      await refetchReviews();
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
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const result = await deleteReviewServerFn({ data: reviewId });
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: async () => {
      await refetchReviews();
    },
  });

  const updatePublishedMutation = useMutation({
    mutationFn: async ({ reviewId, published }: { reviewId: string; published: boolean }) => {
      const result = await updateReviewServerFn({
        data: {
          id: reviewId,
          review: { published },
        },
      });
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: async () => {
      await refetchReviews();
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
      return;
    }

    await createReviewMutation.mutateAsync({
      order,
      item,
      text,
      stars: draft.stars,
      published: draft.publish,
      author,
      avatar: resolveAvatarUrl(draft.avatar || USER_AVATAR),
      images: draft.images.map((url) => ({
        url,
        uploadedAt: new Date().toISOString(),
      })),
      createdAt: new Date().toISOString(),
    });
  };

  useEffect(() => {
    if (!durationOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (durationRef.current && !durationRef.current.contains(event.target as Node)) {
        setDurationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [durationOpen]);

  useEffect(() => {
    if (!highlightReviewForm) return;
    const timer = window.setTimeout(() => setHighlightReviewForm(false), 4500);
    return () => window.clearTimeout(timer);
  }, [highlightReviewForm]);

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    phState.setSubTab("reviews");
    window.requestAnimationFrame(() => {
      productDetailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleSelectOrderForReview = (orderId: string) => {
    setSelectedOrderId(orderId);
    setReviewSubmitError(null);
    phState.resetForm();
    setHighlightReviewForm(true);
    window.requestAnimationFrame(() => {
      productReviewFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const handleProductReviewSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!phState.rating || !phState.feedback.trim() || !selectedOrder) return;

    setReviewSubmitError(null);

    try {
      await createReviewMutation.mutateAsync({
        order: selectedOrder.orderId,
        item: selectedOrder.item,
        text: buildReviewText(phState.title, phState.feedback),
        stars: phState.rating,
        published: true,
        author: CUSTOMER_NAME,
        avatar: resolveAvatarUrl(USER_AVATAR),
        images: phState.images.map((url) => ({
          url,
          uploadedAt: new Date().toISOString(),
        })),
        createdAt: new Date().toISOString(),
      });
      phState.resetForm();
      phState.setSubTab("reviews");
      setReviewSubmitError(null);
    } catch (error) {
      setReviewSubmitError(
        error instanceof Error ? error.message : "Failed to submit review. Please try again.",
      );
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-100 p-4"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <style>{`
        .ai-card-gradient { background: linear-gradient(90deg, #f5f3ff 0%, #faebff 100%); }
        @keyframes reviewFormGlow {
          0%, 100% { box-shadow: 0 0 0 2px rgba(255, 107, 0, 0.25), 0 0 0 0 rgba(255, 107, 0, 0.1); }
          50% { box-shadow: 0 0 0 4px rgba(255, 107, 0, 0.45), 0 0 28px rgba(255, 107, 0, 0.3); }
        }
        .review-form-highlight {
          animation: reviewFormGlow 1.1s ease-in-out 4;
          border-radius: 16px;
          background: linear-gradient(180deg, rgba(255, 107, 0, 0.06) 0%, rgba(255, 255, 255, 1) 55%);
        }
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
                  placeholder="Search products"
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
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
                Tar
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
                    alt="Tarun Choudhary"
                    className="w-20 h-20 rounded-full object-cover"
                    src={USER_AVATAR}
                  />
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Tarun Choudhary</h1>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
                        Active
                      </span>
                      <span className="text-sm text-gray-500">Customer ID #12218125</span>
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

              {activeTab === "Purchase History" && (
                <PurchaseHistoryMain
                  state={phState}
                  orders={filteredPurchaseOrders}
                  selectedOrder={selectedOrder}
                  reviews={productReviews}
                  reviewCount={productReviewCount}
                  activeProductItem={activeProductItem}
                  selectedOrderId={selectedOrderId}
                  onSelectOrder={handleSelectOrder}
                  onWriteReview={handleSelectOrderForReview}
                  onTogglePublished={(reviewId: string, published: boolean) =>
                    updatePublishedMutation.mutate({ reviewId, published })
                  }
                  onDeleteReview={(reviewId: string) => deleteReviewMutation.mutate(reviewId)}
                  isUpdatingReview={updatePublishedMutation.isPending}
                  isDeletingReview={deleteReviewMutation.isPending}
                  productDetailsRef={productDetailsRef}
                  hasActiveSearch={productSearch.trim().length > 0}
                />
              )}
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
                        value={reviewSearch}
                        onChange={(e) => setReviewSearch(e.target.value)}
                      />
                    </div>
                    <div className="relative" ref={durationRef}>
                      <button
                        type="button"
                        onClick={() => setDurationOpen((open) => !open)}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium flex items-center space-x-2 hover:bg-gray-50"
                      >
                        <span>
                          {DURATION_OPTIONS.find((opt) => opt.value === durationFilter)?.label ??
                            "Duration"}
                        </span>
                        <ChevronDown />
                      </button>
                      {durationOpen && (
                        <div className="absolute left-0 top-full z-20 mt-1 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                          {DURATION_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setDurationFilter(opt.value);
                                setDurationOpen(false);
                              }}
                              className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                                durationFilter === opt.value
                                  ? "font-semibold text-gray-900"
                                  : "text-gray-600"
                              }`}
                              style={
                                durationFilter === opt.value ? { color: BRAND } : undefined
                              }
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
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
                          <div className="mt-4 flex flex-wrap gap-2">
                            {draft.images.map((image, idx) => (
                              <div key={idx} className="relative group">
                                <img
                                  src={image}
                                  alt={`Preview ${idx + 1}`}
                                  className="h-16 w-16 object-cover rounded-md border border-gray-200"
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
                        <span className="text-5xl font-bold text-gray-900">
                          {filteredAverageRating}
                        </span>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              filled={i < Math.round(Number(filteredAverageRating))}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {filteredReviewCount}{" "}
                        {filteredReviewCount === 1 ? "review" : "reviews"}
                        {(reviewSearch.trim() || durationFilter !== "all") && (
                          <span className="text-gray-400"> (filtered)</span>
                        )}
                      </p>
                    </div>
                    <div className="flex-1 space-y-2 max-w-sm">
                      {filteredRatingRows.map((r) => (
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

                  {/* Review items */}
                  {filteredReviewCount === 0 && (
                    <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                      <p className="text-sm text-gray-500">
                        No reviews match your search or duration filter.
                      </p>
                    </div>
                  )}
                  {filteredReviews.map((r) => (
                    <ReviewItem
                      key={r._id}
                      order={r.order}
                      stars={r.stars}
                      published={r.published}
                      item={r.item}
                      text={r.text}
                      author={r.author}
                      avatar={resolveAvatarUrl(r.avatar)}
                      images={r.images}
                      onTogglePublished={
                        r._id
                          ? () =>
                              updatePublishedMutation.mutate({
                                reviewId: r._id as string,
                                published: !r.published,
                              })
                          : undefined
                      }
                      onDelete={
                        r._id ? () => deleteReviewMutation.mutate(r._id as string) : undefined
                      }
                      isUpdating={updatePublishedMutation.isPending}
                      isDeleting={deleteReviewMutation.isPending}
                    />
                  ))}
                </>
              )}
            </main>

            {activeTab === "Purchase History" ? (
              <aside className="w-80 flex-none border-l border-gray-100 overflow-y-auto bg-white">
                <PurchaseHistorySidebar
                  state={phState}
                  selectedOrder={selectedOrder}
                  reviewCount={productReviewCount}
                  averageRating={productAverageRating}
                  ratingRows={productRatingRows}
                  onSubmit={handleProductReviewSubmit}
                  isSubmitting={createReviewMutation.isPending}
                  submitError={reviewSubmitError}
                  highlightForm={highlightReviewForm}
                  formRef={productReviewFormRef}
                />
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
  onTogglePublished,
  onDelete,
  isUpdating = false,
  isDeleting = false,
}: {
  order: string;
  stars: number;
  published: boolean;
  item: string;
  text: string;
  author: string;
  avatar: string;
  images?: Array<{ url: string; uploadedAt: string }>;
  onTogglePublished?: () => void;
  onDelete?: () => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}) {
  return (
    <article className="mb-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
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
        <div className="flex items-center gap-2">
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
          {onTogglePublished && (
            <button
              type="button"
              onClick={onTogglePublished}
              disabled={isUpdating}
              className="inline-flex h-7 items-center rounded-md border border-gray-200 bg-white px-2 text-[10px] font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {published ? "Unpublish" : "Publish"}
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-red-100 text-red-500 hover:bg-red-50 disabled:opacity-50"
              title="Delete review"
              aria-label="Delete review"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 7h12M10 11v6m4-6v6M9 7l1-2h4l1 2m-8 0 1 14h8l1-14"
                />
              </svg>
            </button>
          )}
        </div>
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
        <div className="mt-4 flex flex-wrap gap-2">
          {images.map((image, idx) => (
            <div key={idx} className="relative group">
              <img
                src={image.url}
                alt={`Review image ${idx + 1}`}
                className="h-20 w-20 object-cover rounded-md border border-gray-200 hover:border-gray-400 transition"
              />
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 rounded-lg transition" />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

type ProductReview = {
  _id?: string;
  author: string;
  avatar?: string;
  stars: number;
  text: string;
  published?: boolean;
  order?: string;
  createdAt?: string;
  images?: Array<{ url: string; uploadedAt: string }>;
};

const MAX_REVIEW_IMAGE_SIZE = 5 * 1024 * 1024;

function usePurchaseHistoryFormState() {
  const [subTab, setSubTab] = useState<"reviews" | "specs" | "qna">("reviews");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [feedback, setFeedback] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);

  const addImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setImageError("Only image files are allowed.");
      return;
    }
    if (file.size > MAX_REVIEW_IMAGE_SIZE) {
      setImageError("Each image must be 5MB or smaller.");
      return;
    }
    setImageError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const imageData = String(reader.result || "");
      if (imageData) setImages((prev) => [...prev, imageData]);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setRating(0);
    setHover(0);
    setTitle("");
    setFeedback("");
    setImages([]);
    setImageError(null);
  };

  return {
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
    images,
    imageError,
    addImage,
    removeImage,
    resetForm,
  };
}

type PHState = ReturnType<typeof usePurchaseHistoryFormState>;

function OrderStatusBadge({ status }: { status: PurchaseOrder["status"] }) {
  const styles =
    status === "Delivered"
      ? "text-emerald-600"
      : status === "Shipped"
        ? "text-sky-600"
        : "text-amber-600";

  return (
    <p className={`text-sm font-semibold flex items-center gap-1 ${styles}`}>
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      {status}
    </p>
  );
}
const PRODUCT_IMAGES = {
  headphones:
    "https://png.pngtree.com/png-vector/20250321/ourmid/pngtree-wireless-headphone-png-image_15830312.png",

  macbook:
    "https://m.media-amazon.com/images/I/51F-Ok9xuzL.jpg",

  earbuds:
    "https://pngimg.com/uploads/airpods/airpods_PNG17.png",

  watch:
    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/airpods-pro-3-hero-select-202509_FMT_WHH?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1758077264181",


  
};
function PurchaseOrderCard({
  order,
  isSelected,
  onSelect,
  onWriteReview,
}: {
  order: PurchaseOrder;
  isSelected: boolean;
  onSelect: () => void;
  onWriteReview: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <section
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`rounded-xl bg-white shadow-sm overflow-hidden transition-all cursor-pointer hover:shadow-md hover:border-[#ff6b00]/40 ${
        isSelected
          ? "border-2 ring-2 ring-[#ff6b00]/20"
          : "border border-gray-200"
      }`}
      style={isSelected ? { borderColor: BRAND } : undefined}
    >
      <div className="flex flex-col md:flex-row">
        <div
          className="md:w-1/3 p-4 flex flex-col items-center justify-center"
          style={{ backgroundColor: order.panelBg }}
        >
          {order.media.type === "sketchfab" ? (
            <div
              className="relative w-full h-56 md:h-64 overflow-hidden rounded-lg"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              {/* Thumbnail */}
              <img
  src={order.image}
  alt={order.item}
  className={`absolute inset-0 w-full h-full object-contain transition-all duration-300 ${
    hovered ? "opacity-0 scale-95" : "opacity-100 scale-100"
  }`}
/>

              {/* Sketchfab Model */}
              <iframe
                title={order.media.title}
                className={`absolute inset-0 w-full h-full border-0 transition-all duration-300 bg-transparent ${
                  hovered
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-105 pointer-events-none"
                }`}
                frameBorder="0"
                allowFullScreen
                loading="eager"
              
                allow="autoplay; fullscreen; xr-spatial-tracking"
                src={order.media.src}
              />
            </div>
          ) : (
            <img
              src={order.media.src}
              alt={order.media.alt}
              className="max-w-full max-h-56 object-contain drop-shadow-xl"
            />
          )}
        </div>

        <div className="flex-1 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="bg-sky-400 text-white px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide mb-2 inline-block">
                Purchased
              </span>

              <h3 className="text-2xl font-bold" style={{ color: BRAND }}>
                {order.item}
              </h3>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold">{order.price}</p>

              {order.originalPrice && (
                <p className="text-xs text-gray-400 line-through">
                  {order.originalPrice}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-4 mb-6">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-500">
                Color
              </p>
              <p className="text-sm font-semibold">{order.color}</p>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-500">
                Order Date
              </p>
              <p className="text-sm font-semibold">{order.orderDate}</p>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-500">
                Order ID
              </p>
              <p className="text-sm font-semibold">{order.orderId}</p>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-500">
                Status
              </p>
              <OrderStatusBadge status={order.status} />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onWriteReview();
              }}
              className="text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90"
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>

              Write a Review
            </button>

            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="border border-gray-300 px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-50"
            >
              Buy Again
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
function PurchaseHistoryReviewCard({
  review,
  onTogglePublished,
  onDelete,
  isUpdating,
  isDeleting,
}: {
  review: ProductReview;
  onTogglePublished?: () => void;
  onDelete?: () => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}) {
  const published = review.published ?? true;
  const { title, body } = parseReviewText(review.text);

  return (
    <article className="bg-white p-5 rounded-xl border border-gray-200">
      <div className="flex justify-between items-start mb-3 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={resolveAvatarUrl(review.avatar)}
            alt={review.author}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-gray-900">{review.author}</h4>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Reviewed by <span className="font-semibold text-gray-700">{review.author}</span>
              {review.order ? ` · ${review.order}` : ""}
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <div className="flex" style={{ color: BRAND }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5" filled={i < review.stars} />
                ))}
              </div>
              <span className="text-xs text-gray-500">{formatReviewDate(review.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {published ? (
            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded">
              Published
            </span>
          ) : (
            <span className="bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded">
              Unpublished
            </span>
          )}
          {onTogglePublished && (
            <button
              type="button"
              onClick={onTogglePublished}
              disabled={isUpdating}
              className="inline-flex h-7 items-center rounded-md border border-gray-200 bg-white px-2 text-[10px] font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {published ? "Unpublish" : "Publish"}
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-red-100 text-red-500 hover:bg-red-50 disabled:opacity-50"
              title="Delete review"
              aria-label="Delete review"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 7h12M10 11v6m4-6v6M9 7l1-2h4l1 2m-8 0 1 14h8l1-14"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
      {title && <p className="text-sm font-bold text-gray-900 mb-2">{title}</p>}
      <div className="flex gap-4 items-start">
        <p className="text-sm text-gray-800 leading-relaxed flex-1 min-w-0">{body}</p>
        {review.images && review.images.length > 0 && (
          <div className="flex gap-2 flex-shrink-0">
            {review.images.map((image, idx) => (
              <img
                key={idx}
                src={image.url}
                alt={`Review image ${idx + 1}`}
                className="h-20 w-20 object-cover rounded-md border border-gray-200"
              />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function PurchaseHistoryMain({
  state,
  orders,
  selectedOrder,
  reviews,
  reviewCount,
  activeProductItem,
  selectedOrderId,
  onSelectOrder,
  onWriteReview,
  onTogglePublished,
  onDeleteReview,
  isUpdatingReview,
  isDeletingReview,
  productDetailsRef,
  hasActiveSearch,
}: {
  state: PHState;
  orders: PurchaseOrder[];
  selectedOrder: PurchaseOrder | null;
  reviews: ProductReview[];
  reviewCount: number;
  activeProductItem: string;
  selectedOrderId: string | null;
  onSelectOrder: (orderId: string) => void;
  onWriteReview: (orderId: string) => void;
  onTogglePublished: (reviewId: string, published: boolean) => void;
  onDeleteReview: (reviewId: string) => void;
  isUpdatingReview: boolean;
  isDeletingReview: boolean;
  productDetailsRef: React.RefObject<HTMLDivElement | null>;
  hasActiveSearch: boolean;
}) {
  const { subTab, setSubTab } = state;
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

      <div className="space-y-6 mb-8">
        {orders.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-sm text-gray-500">
              {hasActiveSearch
                ? "No orders match your search."
                : "No purchase orders to display."}
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <PurchaseOrderCard
              key={order.id}
              order={order}
              isSelected={selectedOrderId === order.id}
              onSelect={() => onSelectOrder(order.id)}
              onWriteReview={() => onWriteReview(order.id)}
            />
          ))
        )}
      </div>

      {!selectedOrder ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center mb-8">
          <p className="text-sm text-gray-500">
            Click a product card above to view reviews, specifications, and support Q&amp;A.
          </p>
        </div>
      ) : (
      <div ref={productDetailsRef} className="scroll-mt-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">{selectedOrder.item}</h3>
        <p className="text-sm text-gray-500">
          Viewing details for order {selectedOrder.orderId}
        </p>
      </div>

      <nav className="flex gap-8 border-b border-gray-200 mb-6">
        {(
          [
            ["reviews", `Customer Reviews (${reviewCount})`],
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
            {reviews.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
                <p className="text-sm text-gray-500 mb-4">No reviews for this product yet.</p>
                <button
                  type="button"
                  onClick={() => {
                    const order =
                      PURCHASE_ORDERS.find((o) => o.item === activeProductItem) ??
                      PURCHASE_ORDERS[0];
                    onWriteReview(order.id);
                  }}
                  className="text-sm font-bold hover:underline"
                  style={{ color: BRAND }}
                >
                  Be the first to write a review
                </button>
              </div>
            ) : (
              reviews.map((r) => (
                <PurchaseHistoryReviewCard
                  key={r._id}
                  review={r}
                  onTogglePublished={
                    r._id
                      ? () => onTogglePublished(r._id as string, !(r.published ?? true))
                      : undefined
                  }
                  onDelete={r._id ? () => onDeleteReview(r._id as string) : undefined}
                  isUpdating={isUpdatingReview}
                  isDeleting={isDeletingReview}
                />
              ))
            )}
          </div>

          {reviewCount > 0 && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Showing {reviewCount} {reviewCount === 1 ? "review" : "reviews"} for{" "}
                {activeProductItem}
              </p>
            </div>
          )}
        </>
      )}

      {subTab === "specs" && (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h4 className="text-sm font-bold text-gray-900 mb-4">Product Specifications</h4>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selectedOrder.specs.map((spec) => (
              <div key={spec.label} className="rounded-lg bg-gray-50 px-4 py-3 border border-gray-100">
                <dt className="text-[11px] uppercase tracking-wide text-gray-500">{spec.label}</dt>
                <dd className="text-sm font-semibold text-gray-900 mt-1">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
      {subTab === "qna" && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
          <h4 className="text-sm font-bold text-gray-900 mb-2">Support Q&amp;A</h4>
          {selectedOrder.qna.map((entry) => (
            <div key={entry.question} className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-sm font-bold text-gray-900">{entry.question}</p>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">{entry.answer}</p>
            </div>
          ))}
        </div>
      )}
      </div>
      )}
    </div>
  );
}

function PurchaseHistorySidebar({
  state,
  selectedOrder,
  reviewCount,
  averageRating,
  ratingRows,
  onSubmit,
  isSubmitting,
  submitError,
  highlightForm,
  formRef,
}: {
  state: PHState;
  selectedOrder: PurchaseOrder | null;
  reviewCount: number;
  averageRating: string;
  ratingRows: ReturnType<typeof buildRatingRows>;
  onSubmit: (e: FormEvent) => void;
  isSubmitting: boolean;
  submitError: string | null;
  highlightForm: boolean;
  formRef: React.RefObject<HTMLDivElement | null>;
}) {
  const {
    rating,
    setRating,
    hover,
    setHover,
    title,
    setTitle,
    feedback,
    setFeedback,
    images,
    imageError,
    addImage,
    removeImage,
  } = state;
  const filledStars = Math.round(Number(averageRating));

  return (
    <>
      <div className="p-6 border-b border-gray-100">
        <h4 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b-2 border-black inline-block">
          Customer Sentiment
        </h4>
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-bold">{averageRating}</span>
            <div className="flex flex-col">
              <div className="flex" style={{ color: BRAND }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4" filled={i < filledStars} />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                Based on {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            {ratingRows.map((b) => (
              <div key={b.label} className="flex items-center gap-3">
                <span className="w-14 text-xs font-bold">{b.label}</span>
                <div className="flex-1 h-2 bg-white rounded-full overflow-hidden border border-gray-100">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${b.pct}%`, backgroundColor: BRAND }}
                  />
                </div>
                <span className="w-8 text-right text-xs text-gray-500">{b.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={formRef}
        className={`p-6 border-b border-gray-100 transition-all ${highlightForm ? "review-form-highlight -mx-2 px-8" : ""}`}
      >
        <h4 className="text-sm font-bold text-gray-900 mb-2">Write a Review</h4>
        {highlightForm && (
          <p className="text-xs font-bold mb-3 px-3 py-2 rounded-lg border border-[#ff6b00]/30 bg-[#ff6b00]/10" style={{ color: BRAND }}>
            Write your review here
          </p>
        )}
        {selectedOrder ? (
          <p className="text-sm font-semibold mb-4" style={{ color: BRAND }}>
            Add review for {selectedOrder.item} as {CUSTOMER_NAME}
          </p>
        ) : (
          <p className="text-sm text-gray-500 mb-4">
            Select a purchase and click &quot;Write a Review&quot; to get started.
          </p>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
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
          <div>
            <label className="text-[11px] uppercase tracking-wide text-gray-500 block mb-2">
              Add Photos
            </label>
            <label className="cursor-pointer block">
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-gray-300 transition">
                <svg
                  className="w-6 h-6 text-gray-400 mx-auto mb-1"
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
                <p className="text-xs text-gray-500">Click to upload photos</p>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                multiple
                onChange={(e) => {
                  const files = e.target.files;
                  if (!files) return;
                  Array.from(files).forEach((file) => addImage(file));
                  e.target.value = "";
                }}
              />
            </label>
            {images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {images.map((image, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={image}
                      alt={`Upload preview ${idx + 1}`}
                      className="h-14 w-14 object-cover rounded-md border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition"
                      aria-label="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            {imageError && <p className="mt-2 text-xs text-red-600">{imageError}</p>}
          </div>
          {submitError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {submitError}
            </p>
          )}
          <button
            type="submit"
            className="w-full text-white py-3 rounded-lg text-sm font-bold hover:brightness-110 disabled:opacity-50"
            style={{ backgroundColor: BRAND }}
            disabled={!selectedOrder || !rating || !feedback.trim() || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
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
          {PURCHASE_ORDERS.slice(1).map((order) => {
            const thumb =
              order.media.type === "sketchfab"
                ? order.image
                : "https://sketchfab.com/models/a903a7736dbe4b8f966bb90fef020490/embed?autospin=1&autostart=1&transparent=1&ui_theme=dark";

            return (
            <div
              key={order.id}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200"
            >
              <img src={thumb} alt={order.item} className="w-12 h-12 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold truncate">{order.item}</h4>
                <p className="text-xs text-gray-500">Ordered {order.orderDate}</p>
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
            );
          })}
        </div>
      </div>
    </>
  );
}
