export const initialDashboardData = {
  header: {
    date: "Wednesday, 28 October 2026",
    location: "Main boutique",
    title: "Sales dashboard"
  },
  metrics: {
    todaySales: {
      label: "Today's sales",
      value: "$4,820.50",
      change: "12.4% vs yesterday",
      trend: "up"
    },
    invoices: {
      label: "Invoices",
      value: "36",
      change: "4 more than yesterday",
      trend: "up"
    },
    averageBasket: {
      label: "Average basket",
      value: "$133.90",
      change: "0.1% vs yesterday",
      trend: "down"
    },
    needsReorder: {
      label: "Needs reorder",
      value: "14",
      alert: "5 out of stock",
      trend: "alert"
    }
  },
  salesChart: {
    title: "Sales, last 7 days",
    subtitle: "Revenue after discounts",
    totalLabel: "7-day total",
    totalValue: "$28,568.50",
    days: [
      { day: "Thu", rawAmount: 3100, amount: "$3.1k", heightPercent: 48, active: false },
      { day: "Fri", rawAmount: 3500, amount: "$3.5k", heightPercent: 55, active: false },
      { day: "Sat", rawAmount: 5300, amount: "$5.3k", heightPercent: 88, active: false },
      { day: "Sun", rawAmount: 4700, amount: "$4.7k", heightPercent: 76, active: false },
      { day: "Mon", rawAmount: 2900, amount: "$2.9k", heightPercent: 44, active: false },
      { day: "Tue", rawAmount: 4300, amount: "$4.3k", heightPercent: 69, active: false },
      { day: "Wed", rawAmount: 4800, amount: "$4.8k", heightPercent: 78, active: true }
    ]
  },
  topSellers: [
    {
      id: "top-1",
      name: "Noir Santal EDP 50 ml",
      units: 9,
      revenue: "$1,152",
      rawRevenue: 1152,
      percent: 92
    },
    {
      id: "top-2",
      name: "Oud Mirage Extrait 30 ml",
      units: 4,
      revenue: "$840",
      rawRevenue: 840,
      percent: 72
    },
    {
      id: "top-3",
      name: "Rose Éclat EDP 30 ml",
      units: 8,
      revenue: "$592",
      rawRevenue: 592,
      percent: 51
    },
    {
      id: "top-4",
      name: "Amber Dusk EDT 100 ml",
      units: 6,
      revenue: "$492",
      rawRevenue: 492,
      percent: 42
    },
    {
      id: "top-5",
      name: "Jasmin Soleil EDP 50 ml",
      units: 5,
      revenue: "$480",
      rawRevenue: 480,
      percent: 40
    }
  ],
  recentInvoices: [
    {
      id: "INV-2026-01284",
      time: "20:41",
      customer: "Hnin Wai",
      items: 5,
      total: "$316.26",
      rawTotal: 316.26,
      payment: "Card",
      status: "Paid"
    },
    {
      id: "INV-2026-01283",
      time: "20:12",
      customer: "Walk-in",
      items: 1,
      total: "$128.00",
      rawTotal: 128.00,
      payment: "Cash",
      status: "Paid"
    },
    {
      id: "INV-2026-01282",
      time: "19:55",
      customer: "Thiri Aung",
      items: 2,
      total: "$170.00",
      rawTotal: 170.00,
      payment: "Card",
      status: "Paid"
    },
    {
      id: "INV-2026-01281",
      time: "19:30",
      customer: "Walk-in",
      items: 3,
      total: "$214.50",
      rawTotal: 214.50,
      payment: "Mobile pay",
      status: "Pending"
    },
    {
      id: "INV-2026-01280",
      time: "18:47",
      customer: "Ko Zaw",
      items: 1,
      total: "$74.00",
      rawTotal: 74.00,
      payment: "Cash",
      status: "Refunded"
    }
  ],
  lowStockAlerts: [
    {
      id: "low-1",
      name: "Oud Mirage Extrait 30 ml",
      reorderAt: 6,
      stockCount: 2,
      status: "2 left",
      badgeType: "low"
    },
    {
      id: "low-2",
      name: "Citrus Veil EDT 100 ml",
      reorderAt: 8,
      stockCount: 0,
      status: "Out of stock",
      badgeType: "out"
    },
    {
      id: "low-3",
      name: "Musk Linen EDP 50 ml",
      reorderAt: 10,
      stockCount: 4,
      status: "4 left",
      badgeType: "low"
    },
    {
      id: "low-4",
      name: "Amber Dusk EDT 100 ml",
      reorderAt: 12,
      stockCount: 5,
      status: "5 left",
      badgeType: "low"
    }
  ]
};

export const perfumeCatalog = [
  {
    id: "perf-1",
    name: "Noir Santal",
    concentration: "Eau de Parfum (EDP)",
    size: "50 ml",
    sku: "NS-EDP-50",
    price: 128.00,
    stock: 18,
    reorderLevel: 8,
    category: "Woody / Oriental",
    notes: "Australian Sandalwood, Cardamom, Iris, Amber"
  },
  {
    id: "perf-2",
    name: "Oud Mirage",
    concentration: "Extrait de Parfum",
    size: "30 ml",
    sku: "OM-EXT-30",
    price: 210.00,
    stock: 2,
    reorderLevel: 6,
    category: "Oud / Amber",
    notes: "Cambodian Oud, Taif Rose, Saffron, Frankincense"
  },
  {
    id: "perf-3",
    name: "Rose Éclat",
    concentration: "Eau de Parfum (EDP)",
    size: "30 ml",
    sku: "RE-EDP-30",
    price: 74.00,
    stock: 14,
    reorderLevel: 8,
    category: "Floral",
    notes: "Damask Rose, Pink Pepper, Lychee, White Musk"
  },
  {
    id: "perf-4",
    name: "Amber Dusk",
    concentration: "Eau de Toilette (EDT)",
    size: "100 ml",
    sku: "AD-EDT-100",
    price: 82.00,
    stock: 5,
    reorderLevel: 12,
    category: "Warm Spice",
    notes: "Golden Amber, Madagascar Vanilla, Cedarwood"
  },
  {
    id: "perf-5",
    name: "Jasmin Soleil",
    concentration: "Eau de Parfum (EDP)",
    size: "50 ml",
    sku: "JS-EDP-50",
    price: 96.00,
    stock: 11,
    reorderLevel: 6,
    category: "Fresh Floral",
    notes: "Grasse Jasmine, Neroli, Bergamot, Tonka"
  },
  {
    id: "perf-6",
    name: "Citrus Veil",
    concentration: "Eau de Toilette (EDT)",
    size: "100 ml",
    sku: "CV-EDT-100",
    price: 68.00,
    stock: 0,
    reorderLevel: 8,
    category: "Citrus Aromatic",
    notes: "Calabrian Bergamot, Bitter Orange, Petitgrain"
  },
  {
    id: "perf-7",
    name: "Musk Linen",
    concentration: "Eau de Parfum (EDP)",
    size: "50 ml",
    sku: "ML-EDP-50",
    price: 85.00,
    stock: 4,
    reorderLevel: 10,
    category: "Clean Musk",
    notes: "Cashmere Wood, Aldehydes, White Lily, Cotton"
  }
];

export const staffUsers = [
  {
    id: "usr-1",
    code: "C1",
    label: "Cashier 01",
    name: "Cashier 01",
    staffName: "Thiri Aung",
    username: "cashier01",
    email: "cashier01@prestige.com",
    pin: "1234",
    password: "password123",
    role: "Cashier 01 · Fragrance Specialist",
    initials: "C1",
    terminal: "Terminal 01 (Downtown Flagship)",
    shift: "Morning - Afternoon (09:00 - 18:00)",
    permissions: "POS Sales & Ring-up Access",
    roleId: "EMP-88301",
    avatarBg: "var(--purple-brand)"
  },
  {
    id: "usr-2",
    code: "C2",
    label: "Cashier 02",
    name: "Cashier 02",
    staffName: "Ko Zaw",
    username: "cashier02",
    email: "cashier02@prestige.com",
    pin: "1234",
    password: "password123",
    role: "Cashier 02 · Fragrance Specialist",
    initials: "C2",
    terminal: "Terminal 02 (Downtown Flagship)",
    shift: "Afternoon - Evening (13:00 - 22:00)",
    permissions: "POS Sales & Ring-up Access",
    roleId: "EMP-88302",
    avatarBg: "var(--purple-primary)"
  },
  {
    id: "usr-3",
    code: "M",
    label: "Manager",
    name: "Manager",
    staffName: "Aye Chan",
    username: "manager",
    email: "manager@prestige.com",
    pin: "1234",
    password: "password123",
    role: "Store Manager",
    initials: "M",
    terminal: "Terminal 01 (Downtown Flagship)",
    shift: "Full Shift (09:00 - 21:00)",
    permissions: "Full POS, Inventory & Financial Access",
    roleId: "EMP-88219",
    avatarBg: "var(--gold-accent)"
  }
];



