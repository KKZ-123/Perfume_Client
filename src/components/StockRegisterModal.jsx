import React, { useState, useEffect, useRef } from 'react';
import { CloseIcon, PlusIcon, BoxStockIcon, RefreshIcon, ChevronDownIcon, CheckIcon } from './Icons';
import { API_BASE_URL, API_ENDPOINTS, apiFetch, getAccessToken } from '../config/api';

// Categories list matching luxury perfumery standards
const CATEGORIES = [
  'Woody / Oriental',
  'Floral',
  'Warm Spice',
  'Fresh / Citrus',
  'Oud / Amber',
  'Gourmand',
  'Aromatic / Fougère',
  'Chypre / Leather'
];

// Concentrations / Types
const CONCENTRATIONS = [
  { value: 'EDP', label: 'EDP — Eau de Parfum' },
  { value: 'EDT', label: 'EDT — Eau de Toilette' },
  { value: 'Extrait', label: 'Extrait — Extrait de Parfum' },
  { value: 'EDC', label: 'EDC — Cologne' },
  { value: 'Oil', label: 'Parfum Oil' }
];

// Genders
const GENDERS = ['Male', 'Female', 'Unisex'];

// Standard perfume sizes
const SIZES = ['30 ml', '50 ml', '100 ml', '150 ml', '200 ml'];

// Helper to generate a standardized SKU based on name, concentration, and size
const generateSuggestedSku = (name, concentration, size) => {
  const nameParts = (name || 'PERF').trim().split(/\s+/);
  const initials = nameParts.length === 1 
    ? nameParts[0].slice(0, 3).toUpperCase() 
    : nameParts.map(p => p[0]).join('').slice(0, 3).toUpperCase();
  
  let concCode = 'EDP';
  const cStr = typeof concentration === 'object' ? concentration.value : String(concentration || '');
  if (cStr.includes('Extrait') || cStr === 'EXT' || cStr === 'Extrait') concCode = 'EXT';
  else if (cStr.includes('Toilette') || cStr === 'EDT') concCode = 'EDT';
  else if (cStr.includes('Cologne') || cStr === 'EDC') concCode = 'EDC';
  else if (cStr.includes('Oil')) concCode = 'OIL';

  const sizeCode = (String(size) || '100').replace(/[^0-9]/g, '') || '100';
  return `${initials}-${concCode}-${sizeCode}`;
};

export const StockRegisterModal = ({
  isOpen,
  onClose,
  catalog = [],
  onRegisterStock,
  initialMode = 'new', // 'new' or 'restock'
  initialItem = null
}) => {
  if (!isOpen) return null;

  return (
    <StockRegisterForm
      onClose={onClose}
      catalog={catalog}
      onRegisterStock={onRegisterStock}
      initialMode={initialMode}
      initialItem={initialItem}
    />
  );
};

const StockRegisterForm = ({
  onClose,
  catalog = [],
  onRegisterStock,
  initialMode = 'new',
  initialItem = null
}) => {
  const [mode, setMode] = useState(initialMode || 'new'); // 'new' | 'restock'
  
  // Brands fetched from API
  const [brands, setBrands] = useState([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [brand, setBrand] = useState('');
  const [brandSyskey, setBrandSyskey] = useState('');
  const [brandInput, setBrandInput] = useState('');
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const [isCreatingBrand, setIsCreatingBrand] = useState(false);
  const [brandFeedback, setBrandFeedback] = useState(null); // { type: 'success' | 'error' | 'warning' | 'info', message: string }
  const brandContainerRef = useRef(null);
  const brandInputRef = useRef(null);

  // Helper to obtain bearer token
  const getAuthToken = () => {
    const token = getAccessToken();
    if (token) return token;
    return (
      localStorage.getItem('pos_access_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('access_token') ||
      ''
    );
  };

  // Fetch brand list from API (GET http://localhost:5000/api/brands)
  const fetchBrands = async () => {
    setBrandsLoading(true);
    try {
      const token = getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await apiFetch(`${API_BASE_URL}/brands`, {
        method: 'GET',
        headers
      });
      const json = await res.json().catch(() => ({}));
      if (json.success && Array.isArray(json.data)) {
        setBrands(json.data);
        if (json.data.length > 0 && !brand) {
          setBrand(json.data[0].name);
          setBrandInput(json.data[0].name);
          setBrandSyskey(json.data[0].syskey || '');
        }
      }
    } catch (err) {
      console.error('Failed to fetch brands:', err);
    } finally {
      setBrandsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // Handle clicking outside the brand combobox
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (brandContainerRef.current && !brandContainerRef.current.contains(e.target)) {
        setIsBrandDropdownOpen(false);
        // If user typed something and clicked away without selecting, sync with current brand or match
        if (brandInput && brandInput.trim()) {
          const match = brands.find(
            (b) => b.name && b.name.toLowerCase() === brandInput.trim().toLowerCase()
          );
          if (match) {
            setBrand(match.name);
            setBrandInput(match.name);
            setBrandSyskey(match.syskey || '');
          } else if (brand) {
            setBrandInput(brand);
          }
        } else if (brand) {
          setBrandInput(brand);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [brand, brandInput, brands]);

  // Insert brand API handler: POST http://localhost:5000/api/brands with Bearer Token { "name": "..." }
  const handleCreateBrand = async (rawName) => {
    const brandNameToAdd = (rawName || brandInput).trim();
    if (!brandNameToAdd) return null;

    // Check if brand already exists in list (case-insensitive)
    const existing = brands.find(
      (b) => b.name && b.name.toLowerCase() === brandNameToAdd.toLowerCase()
    );
    if (existing) {
      setBrand(existing.name);
      setBrandInput(existing.name);
      setBrandSyskey(existing.syskey || '');
      setIsBrandDropdownOpen(false);
      setBrandFeedback({ type: 'info', message: `Selected existing brand "${existing.name}".` });
      setTimeout(() => setBrandFeedback(null), 3000);
      return existing;
    }

    setIsCreatingBrand(true);
    setBrandFeedback(null);

    try {
      const token = getAuthToken();
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await apiFetch(`${API_BASE_URL}/brands`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: brandNameToAdd })
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok && (json.success !== false)) {
        const createdBrand =
          json.data && typeof json.data === 'object' && json.data.name
            ? json.data
            : {
                autoid: json.data?.autoid || Date.now(),
                syskey: json.data?.syskey || `brand-${Date.now()}`,
                name: brandNameToAdd
              };

        setBrands((prev) => {
          if (prev.some((b) => b.name.toLowerCase() === createdBrand.name.toLowerCase())) {
            return prev;
          }
          return [...prev, createdBrand];
        });

        setBrand(createdBrand.name);
        setBrandInput(createdBrand.name);
        setBrandSyskey(createdBrand.syskey || '');
        setIsBrandDropdownOpen(false);
        setBrandFeedback({
          type: 'success',
          message: `Brand "${createdBrand.name}" created successfully!`
        });
        setTimeout(() => setBrandFeedback(null), 3500);
        return createdBrand;
      } else {
        const errMsg = json.error || json.message || 'Failed to create brand.';
        setBrandFeedback({ type: 'error', message: errMsg });
        return null;
      }
    } catch (err) {
      console.error('Error creating brand via API:', err);
      // Fallback: register locally if server is unreachable
      const fallbackBrand = {
        autoid: Date.now(),
        syskey: `brand-${Date.now()}`,
        name: brandNameToAdd
      };
      setBrands((prev) => [...prev, fallbackBrand]);
      setBrand(fallbackBrand.name);
      setBrandInput(fallbackBrand.name);
      setBrandSyskey(fallbackBrand.syskey || '');
      setIsBrandDropdownOpen(false);
      setBrandFeedback({
        type: 'warning',
        message: `Offline mode: Brand "${brandNameToAdd}" added locally.`
      });
      setTimeout(() => setBrandFeedback(null), 4000);
      return fallbackBrand;
    } finally {
      setIsCreatingBrand(false);
    }
  };

  // New Fragrance Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [gender, setGender] = useState(GENDERS[0]);
  const [concentration, setConcentration] = useState(CONCENTRATIONS[0].value);
  const [size, setSize] = useState('100 ml');
  const [originalPrice, setOriginalPrice] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('25');
  const [reorderLevel, setReorderLevel] = useState('6');
  const [status, setStatus] = useState('Active');
  const [notes, setNotes] = useState('');
  const [batchCode, setBatchCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Restock Existing Fragrance Form State
  const defaultItem = initialItem || catalog[0] || null;
  const [selectedItemId, setSelectedItemId] = useState(defaultItem?.id || '');
  const [restockQty, setRestockQty] = useState(10);
  const [restockOriginalPrice, setRestockOriginalPrice] = useState(defaultItem ? String(defaultItem.originalPrice || '') : '');
  const [restockPrice, setRestockPrice] = useState(defaultItem ? String(defaultItem.price || '') : '');
  const [restockReorderLevel, setRestockReorderLevel] = useState(defaultItem ? String(defaultItem.reorderLevel || '') : '');
  const [restockBatch, setRestockBatch] = useState('');
  const [restockNotes, setRestockNotes] = useState('');

  // UI state
  const [error, setError] = useState('');

  // When selected item for restock changes, update restock defaults
  const handleSelectedItemChange = (id) => {
    setSelectedItemId(id);
    const found = catalog.find(p => p.id === id);
    if (found) {
      setRestockOriginalPrice(String(found.originalPrice || ''));
      setRestockPrice(String(found.price || ''));
      setRestockReorderLevel(String(found.reorderLevel || ''));
    }
  };

  const handleAutoSku = () => {
    if (!name.trim()) {
      setError('Please enter a fragrance name first to auto-generate SKU.');
      return;
    }
    setError('');
    const suggested = generateSuggestedSku(name, concentration, size);
    setSku(suggested);
  };

  const currentSelectedItem = catalog.find(p => p.id === selectedItemId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'new') {
      if (!name.trim()) {
        setError('Fragrance name is required.');
        return;
      }
      if (originalPrice !== '') {
        const origPriceNum = parseFloat(originalPrice);
        if (isNaN(origPriceNum) || origPriceNum < 0) {
          setError('Please enter a valid original price.');
          return;
        }
      }
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum < 0) {
        setError('Please enter a valid retail price.');
        return;
      }
      const stockNum = parseInt(stock, 10);
      if (isNaN(stockNum) || stockNum < 0) {
        setError('Please enter a valid stock quantity.');
        return;
      }
      const reorderNum = parseInt(reorderLevel, 10);
      if (isNaN(reorderNum) || reorderNum < 0) {
        setError('Please enter a valid reorder threshold level.');
        return;
      }

      setIsSubmitting(true);

      try {
        // Check if user entered a new brand that needs to be registered
        let finalBrand = brand;
        let finalBrandSyskey = brandSyskey;
        const typedBrand = brandInput.trim();

        if (typedBrand) {
          const match = brands.find(
            (b) => b.name && b.name.toLowerCase() === typedBrand.toLowerCase()
          );
          if (match) {
            finalBrand = match.name;
            finalBrandSyskey = match.syskey || match.id || '';
          } else {
            // Auto create via API POST http://localhost:5000/api/brands
            const created = await handleCreateBrand(typedBrand);
            if (created && created.name) {
              finalBrand = created.name;
              finalBrandSyskey = created.syskey || created.id || '';
            } else {
              finalBrand = typedBrand;
            }
          }
        } else if (brand) {
          const match = brands.find(
            (b) => b.name && b.name.toLowerCase() === brand.toLowerCase()
          );
          if (match) {
            finalBrandSyskey = match.syskey || match.id || '';
          }
        }

        const finalSku = sku.trim() || generateSuggestedSku(name, concentration, size);
        const sizeMl = parseInt(String(size).replace(/[^0-9]/g, ''), 10) || 100;
        const origPriceNum = originalPrice !== '' ? parseFloat(originalPrice) : 0;
        const genderVal = gender || 'Male';
        const typeVal = typeof concentration === 'object' ? concentration.value : (concentration || 'EDP');
        const statusVal = status || 'Active';

        // Prepare payload for POST /api/perfumes
        const payload = {
          code: finalSku,
          brand_syskey: finalBrandSyskey || '',
          name: name.trim(),
          type: typeVal,
          size_ml: sizeMl,
          qty: stockNum,
          gender: genderVal,
          original_price: origPriceNum,
          sell_price: priceNum,
          status: statusVal
        };

        const token = getAuthToken();
        const headers = {
          'Content-Type': 'application/json'
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await apiFetch(API_ENDPOINTS.PERFUMES, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });

        const json = await res.json().catch(() => ({}));

        if (res.ok && json.success !== false) {
          const responseData = json.data || {};
          if (onRegisterStock) {
            onRegisterStock({
              id: responseData.id || responseData.syskey || `perf-${Date.now()}`,
              syskey: responseData.syskey || finalBrandSyskey,
              isExisting: false,
              name: name.trim(),
              sku: finalSku,
              code: finalSku,
              brand: finalBrand || 'Chanel',
              brand_syskey: finalBrandSyskey,
              category,
              gender: genderVal,
              concentration: typeVal,
              type: typeVal,
              size: `${sizeMl} ml`,
              size_ml: sizeMl,
              originalPrice: origPriceNum,
              original_price: origPriceNum,
              price: priceNum,
              sell_price: priceNum,
              stock: stockNum,
              qty: stockNum,
              reorderLevel: reorderNum,
              status: statusVal,
              notes: notes.trim() || 'Signature boutique fragrance',
              batchCode: batchCode.trim()
            });
          }
          onClose();
        } else {
          const errMsg = json.error || json.message || 'Failed to register fragrance on server.';
          setError(errMsg);
        }
      } catch (err) {
        console.error('Error submitting perfume API:', err);
        // Fallback for offline mode so user can still work
        const finalSku = sku.trim() || generateSuggestedSku(name, concentration, size);
        const sizeMl = parseInt(String(size).replace(/[^0-9]/g, ''), 10) || 100;
        const origPriceNum = originalPrice !== '' ? parseFloat(originalPrice) : 0;
        const priceNum = parseFloat(price) || 0;
        const stockNum = parseInt(stock, 10) || 0;
        const genderVal = gender || 'Male';
        const typeVal = typeof concentration === 'object' ? concentration.value : (concentration || 'EDP');
        const statusVal = status || 'Active';

        if (onRegisterStock) {
          onRegisterStock({
            id: `perf-${Date.now()}`,
            isExisting: false,
            name: name.trim(),
            sku: finalSku,
            code: finalSku,
            brand: brand || 'Chanel',
            brand_syskey: brandSyskey || '',
            category,
            gender: genderVal,
            concentration: typeVal,
            type: typeVal,
            size: `${sizeMl} ml`,
            size_ml: sizeMl,
            originalPrice: origPriceNum,
            original_price: origPriceNum,
            price: priceNum,
            sell_price: priceNum,
            stock: stockNum,
            qty: stockNum,
            reorderLevel: reorderNum,
            status: statusVal,
            notes: notes.trim() || 'Signature boutique fragrance',
            batchCode: batchCode.trim()
          });
        }
        onClose();
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Restock existing item
      if (!currentSelectedItem) {
        setError('Please select a fragrance to restock.');
        return;
      }
      const addQty = parseInt(restockQty, 10);
      if (isNaN(addQty) || addQty <= 0) {
        setError('Please enter a valid quantity of units to add (minimum 1).');
        return;
      }

      if (onRegisterStock) {
        onRegisterStock({
          isExisting: true,
          existingId: currentSelectedItem.id,
          name: currentSelectedItem.name,
          stock: addQty,
          originalPrice: restockOriginalPrice !== '' ? parseFloat(restockOriginalPrice) : currentSelectedItem.originalPrice,
          price: restockPrice !== '' ? parseFloat(restockPrice) : currentSelectedItem.price,
          reorderLevel: restockReorderLevel !== '' ? parseInt(restockReorderLevel, 10) : currentSelectedItem.reorderLevel,
          batchCode: restockBatch.trim(),
          notes: restockNotes.trim()
        });
      }
      onClose();
    }
  };

  const trimmedBrandInput = brandInput.trim().toLowerCase();
  const filteredBrands = brands.filter((b) =>
    b.name && b.name.toLowerCase().includes(trimmedBrandInput)
  );
  const exactBrandMatch = brands.some(
    (b) => b.name && b.name.toLowerCase() === trimmedBrandInput
  );
  const showAddBrandSuggestion = trimmedBrandInput.length > 0 && !exactBrandMatch;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1050 }}>
      <div 
        className="modal-card stock-register-modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', width: '92%', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <span className="header-eyebrow" style={{ fontSize: '11px' }}>
              Inventory Ledger · Stock Management
            </span>
            <h2 className="modal-title" style={{ fontSize: '20px', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BoxStockIcon className="w-5 h-5" style={{ color: 'var(--purple-brand)' }} />
              <span>Stock Register</span>
            </h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close modal">
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="sr-mode-tabs">
          <button
            type="button"
            className={`time-pill ${mode === 'new' ? 'active' : ''}`}
            onClick={() => { setMode('new'); setError(''); }}
            style={{ padding: '8px 16px', fontSize: '12.5px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>Register New Fragrance</span>
          </button>
          <button
            type="button"
            className={`time-pill ${mode === 'restock' ? 'active' : ''}`}
            onClick={() => { setMode('restock'); setError(''); }}
            style={{ padding: '8px 16px', fontSize: '12.5px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshIcon className="w-3.5 h-3.5" />
            <span>Receive / Restock Existing</span>
          </button>
        </div>

        {/* Error notification banner */}
        {error && (
          <div style={{
            background: 'var(--red-alert-bg)',
            color: 'var(--red-alert-text)',
            padding: '10px 14px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'new' ? (
            /* ================= MODE: NEW FRAGRANCE PRODUCT ================= */
            <>
              {/* Row 1: Fragrance Name & SKU */}
              <div className="sr-row-name-sku">
                <div className="pos-form-group" style={{ marginBottom: 0 }}>
                  <label className="pos-label">
                    Fragrance Name <span style={{ color: 'var(--red-alert)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="pos-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    // placeholder="e.g. Velvet Tonka, Rose Royale"
                    required
                  />
                </div>

                <div className="pos-form-group" style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="pos-label">SKU Code</label>
                    <button
                      type="button"
                      onClick={handleAutoSku}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--purple-brand)',
                        fontSize: '11px',
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline'
                      }}
                      title="Auto-generate SKU from name & concentration"
                    >
                      Auto-generate
                    </button>
                  </div>
                  <input
                    type="text"
                    className="pos-input"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    // placeholder="e.g. VT-EDP-50"
                    style={{ fontFamily: 'monospace', fontWeight: 600 }}
                  />
                </div>
              </div>

              {/* Row 2: Brand, Gender, Type, Size */}
              <div className="sr-row-details">
                <div
                  ref={brandContainerRef}
                  className="pos-form-group"
                  style={{
                    marginBottom: 0,
                    position: 'relative',
                    zIndex: isBrandDropdownOpen ? 30 : 1
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="pos-label">Brand</label>
                    {isCreatingBrand && (
                      <span style={{ fontSize: '11px', color: 'var(--purple-brand)', fontWeight: 600 }}>
                        Adding brand...
                      </span>
                    )}
                  </div>
                  <div className="pos-select-wrapper" style={{ position: 'relative' }}>
                    <input
                      ref={brandInputRef}
                      type="text"
                      className="pos-input"
                      value={brandInput}
                      onChange={(e) => {
                        setBrandInput(e.target.value);
                        if (!isBrandDropdownOpen) setIsBrandDropdownOpen(true);
                      }}
                      onFocus={() => setIsBrandDropdownOpen(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (showAddBrandSuggestion) {
                            handleCreateBrand(brandInput);
                          } else if (filteredBrands.length > 0) {
                            setBrand(filteredBrands[0].name);
                            setBrandInput(filteredBrands[0].name);
                            setIsBrandDropdownOpen(false);
                          }
                        } else if (e.key === 'Escape') {
                          setIsBrandDropdownOpen(false);
                        }
                      }}
                      placeholder="Type or select brand..."
                      style={{ paddingRight: '32px' }}
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsBrandDropdownOpen((prev) => !prev);
                        brandInputRef.current?.focus();
                      }}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: 'var(--text-muted, #78716c)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Toggle brand suggestions"
                    >
                      <ChevronDownIcon
                        className="w-4 h-4"
                        style={{
                          transform: isBrandDropdownOpen ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s ease'
                        }}
                      />
                    </button>
                  </div>

                  {/* Dropdown Suggestions List */}
                  {isBrandDropdownOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        right: 0,
                        minWidth: '220px',
                        maxHeight: '220px',
                        overflowY: 'auto',
                        background: '#ffffff',
                        border: '1px solid #dfd8e6',
                        borderRadius: '10px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                        zIndex: 100
                      }}
                    >
                      {/* Suggestion to insert brand if user typed a name not in brand list */}
                      {showAddBrandSuggestion && (
                        <div
                          className="brand-suggestion-add-item"
                          onClick={() => handleCreateBrand(brandInput)}
                          style={{
                            padding: '10px 12px',
                            background: '#faf5ff',
                            borderBottom: '1px solid #ede4f5',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px',
                            color: 'var(--purple-brand, #7c3aed)',
                            fontWeight: 600,
                            fontSize: '12.5px',
                            transition: 'background 0.15s ease'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#f3e8ff')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = '#faf5ff')}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                            <PlusIcon className="w-3.5 h-3.5" style={{ flexShrink: 0 }} />
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              Add <strong>"{brandInput.trim()}"</strong>
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: '10px',
                              background: 'var(--purple-brand, #7c3aed)',
                              color: '#fff',
                              padding: '2px 7px',
                              borderRadius: '6px',
                              fontWeight: 600,
                              flexShrink: 0
                            }}
                          >
                            {isCreatingBrand ? 'Saving...' : 'New Brand'}
                          </span>
                        </div>
                      )}

                      {/* Filtered Brands List */}
                      {filteredBrands.length > 0 ? (
                        filteredBrands.map((b) => {
                          const isSelected = b.name && b.name.toLowerCase() === (brand || '').toLowerCase();
                          return (
                            <div
                              key={b.autoid || b.syskey || b.name}
                              onClick={() => {
                                setBrand(b.name);
                                setBrandInput(b.name);
                                setBrandSyskey(b.syskey || '');
                                setIsBrandDropdownOpen(false);
                                setBrandFeedback(null);
                              }}
                              style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                fontSize: '13px',
                                background: isSelected ? '#f5f0fa' : 'transparent',
                                color: isSelected ? 'var(--purple-brand, #7c3aed)' : 'var(--text-main, #1c1917)',
                                fontWeight: isSelected ? 600 : 400
                              }}
                              onMouseEnter={(e) => {
                                if (!isSelected) e.currentTarget.style.background = '#f9f7fa';
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected) e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              <span>{b.name}</span>
                              {isSelected && (
                                <CheckIcon className="w-3.5 h-3.5" style={{ color: 'var(--purple-brand)' }} />
                              )}
                            </div>
                          );
                        })
                      ) : (
                        !showAddBrandSuggestion && (
                          <div
                            style={{
                              padding: '12px',
                              textAlign: 'center',
                              color: 'var(--text-muted, #78716c)',
                              fontSize: '12px'
                            }}
                          >
                            {brandsLoading ? 'Loading brands...' : 'No brands available'}
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {/* Feedback Message */}
                  {brandFeedback && (
                    <div
                      style={{
                        fontSize: '11px',
                        marginTop: '4px',
                        color:
                          brandFeedback.type === 'error'
                            ? 'var(--red-alert, #ef4444)'
                            : brandFeedback.type === 'success'
                            ? '#16a34a'
                            : 'var(--purple-brand, #7c3aed)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>
                        {brandFeedback.type === 'success' ? '✓' : brandFeedback.type === 'error' ? '⚠️' : 'ℹ️'}
                      </span>
                      <span>{brandFeedback.message}</span>
                    </div>
                  )}
                </div>

                <div className="pos-form-group" style={{ marginBottom: 0 }}>
                  <label className="pos-label">Gender</label>
                  <div className="pos-select-wrapper">
                    <select
                      className="pos-select"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      {GENDERS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                    <div className="pos-select-icon">
                      <ChevronDownIcon className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="pos-form-group" style={{ marginBottom: 0 }}>
                  <label className="pos-label">Type</label>
                  <div className="pos-select-wrapper">
                    <select
                      className="pos-select"
                      value={concentration}
                      onChange={(e) => setConcentration(e.target.value)}
                    >
                      {CONCENTRATIONS.map((conc) => (
                        <option
                          key={typeof conc === 'object' ? conc.value : conc}
                          value={typeof conc === 'object' ? conc.value : conc}
                        >
                          {typeof conc === 'object' ? conc.label : conc}
                        </option>
                      ))}
                    </select>
                    <div className="pos-select-icon">
                      <ChevronDownIcon className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="pos-form-group" style={{ marginBottom: 0 }}>
                  <label className="pos-label">Bottle Size</label>
                  <div className="pos-select-wrapper">
                    <select
                      className="pos-select"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                    >
                      {SIZES.map((sz) => (
                        <option key={sz} value={sz}>{sz}</option>
                      ))}
                    </select>
                    <div className="pos-select-icon">
                      <ChevronDownIcon className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3: Original Price, Retail Price, Initial Stock, Reorder Level */}
              <div className="sr-row-pricing">
                <div className="pos-form-group" style={{ marginBottom: 0 }}>
                  <label className="pos-label">
                    Original Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="pos-input"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="140"
                    style={{ fontWeight: 600 }}
                  />
                </div>

                <div className="pos-form-group" style={{ marginBottom: 0 }}>
                  <label className="pos-label">
                    Retail Price <span style={{ color: 'var(--red-alert)' }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="pos-input"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="165"
                    required
                    style={{ fontWeight: 600 }}
                  />
                </div>

                <div className="pos-form-group" style={{ marginBottom: 0 }}>
                  <label className="pos-label">
                    Initial Stock <span style={{ color: 'var(--red-alert)' }}>*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="pos-input"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="25"
                    required
                  />
                </div>

                <div className="pos-form-group" style={{ marginBottom: 0 }}>
                  <label className="pos-label">
                    Reorder Alert Level
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="pos-input"
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(e.target.value)}
                    placeholder="6"
                    required
                  />
                </div>
              </div>

              {/* Row 4: Olfactory Notes */}
              <div className="pos-form-group" style={{ marginBottom: '16px' }}>
                <label className="pos-label">Remark</label>
                <input
                  type="text"
                  className="pos-input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Cardamom, Bourbon Vanilla, Cedarwood, Tonka"
                />
              </div>

              {/* Row 5: Batch / Lot Code */}
              {/* <div className="pos-form-group" style={{ marginBottom: '22px' }}>
                <label className="pos-label">Batch / Lot Code (Optional)</label>
                <input
                  type="text"
                  className="pos-input"
                  value={batchCode}
                  onChange={(e) => setBatchCode(e.target.value)}
                  placeholder="e.g. BATCH-2026-03"
                  style={{ fontFamily: 'monospace' }}
                />
              </div> */}
            </>
          ) : (
            /* ================= MODE: RESTOCK EXISTING FRAGRANCE ================= */
            <>
              {/* Select Existing Perfume */}
              <div className="pos-form-group" style={{ marginBottom: '16px' }}>
                <label className="pos-label">
                  Select Fragrance to Restock <span style={{ color: 'var(--red-alert)' }}>*</span>
                </label>
                <div className="pos-select-wrapper">
                  <select
                    className="pos-select"
                    value={selectedItemId}
                    onChange={(e) => handleSelectedItemChange(e.target.value)}
                    style={{ fontWeight: 600 }}
                  >
                    {catalog.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.sku}) — Current Stock: {item.stock} units
                      </option>
                    ))}
                  </select>
                  <div className="pos-select-icon">
                    <ChevronDownIcon className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Current Item Stats Badge Card */}
              {currentSelectedItem && (
                <div 
                  className="pos-cart-list"
                  style={{
                    background: '#fcfafc',
                    border: '1px solid #ebe4f2',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    marginBottom: '16px',
                    fontSize: '13px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div>
                      <strong style={{ fontSize: '14px', color: 'var(--text-main)' }}>{currentSelectedItem.name}</strong>
                      <span style={{ marginLeft: '8px', color: 'var(--purple-brand)', fontFamily: 'monospace', fontSize: '12px' }}>
                        {currentSelectedItem.sku}
                      </span>
                    </div>
                    <span 
                      className={`stock-tag ${currentSelectedItem.stock === 0 ? 'out' : currentSelectedItem.stock <= currentSelectedItem.reorderLevel ? 'low' : ''}`}
                      style={{ fontSize: '11px', margin: 0 }}
                    >
                      {currentSelectedItem.stock === 0 
                        ? 'Out of stock' 
                        : currentSelectedItem.stock <= currentSelectedItem.reorderLevel 
                          ? `${currentSelectedItem.stock} low stock` 
                          : `${currentSelectedItem.stock} in stock`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: '12px' }}>
                    <span>Size: {currentSelectedItem.size}</span>
                    <span>Concentration: {currentSelectedItem.concentration}</span>
                    {currentSelectedItem.gender && <span>Gender: {currentSelectedItem.gender}</span>}
                    <span>Retail Price: {Number.isInteger(Number(currentSelectedItem.price)) ? Number(currentSelectedItem.price) : parseFloat(Number(currentSelectedItem.price || 0).toFixed(2))}</span>
                    {Number(currentSelectedItem.originalPrice) > 0 && (
                      <span>Original Price: {Number.isInteger(Number(currentSelectedItem.originalPrice)) ? Number(currentSelectedItem.originalPrice) : parseFloat(Number(currentSelectedItem.originalPrice).toFixed(2))}</span>
                    )}
                    <span>Reorder Level: {currentSelectedItem.reorderLevel} units</span>
                  </div>
                </div>
              )}

              {/* Units to Add with Quick Preset Pills */}
              <div className="pos-form-group" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="pos-label">
                    Units to Add <span style={{ color: 'var(--red-alert)' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                    {[5, 10, 20, 50].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setRestockQty(num)}
                        className={`time-pill ${restockQty === num ? 'active' : ''}`}
                        style={{ padding: '2px 8px', fontSize: '11px', cursor: 'pointer' }}
                      >
                        +{num}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="number"
                  min="1"
                  className="pos-input"
                  value={restockQty}
                  onChange={(e) => setRestockQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  required
                  style={{ fontWeight: 700, fontSize: '15px' }}
                />
              </div>

              {/* Projected Stock Preview */}
              {currentSelectedItem && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#f6f3fa',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '13px'
                }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Projected New Stock:</span>
                  <span style={{ fontWeight: 700, color: 'var(--purple-brand)', fontSize: '15px' }}>
                    {currentSelectedItem.stock} + {restockQty || 0} = {(currentSelectedItem.stock || 0) + (parseInt(restockQty, 10) || 0)} units
                  </span>
                </div>
              )}

              {/* Price & Reorder Level Update (Optional) */}
              <div className="sr-row-pricing">
                <div className="pos-form-group" style={{ marginBottom: 0 }}>
                  <label className="pos-label">Adjust Original Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="pos-input"
                    value={restockOriginalPrice}
                    onChange={(e) => setRestockOriginalPrice(e.target.value)}
                    placeholder="Leave unchanged"
                  />
                </div>

                <div className="pos-form-group" style={{ marginBottom: 0 }}>
                  <label className="pos-label">Adjust Retail Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="pos-input"
                    value={restockPrice}
                    onChange={(e) => setRestockPrice(e.target.value)}
                    placeholder="Leave unchanged"
                  />
                </div>

                <div className="pos-form-group" style={{ marginBottom: 0 }}>
                  <label className="pos-label">Adjust Reorder Alert Level</label>
                  <input
                    type="number"
                    min="1"
                    className="pos-input"
                    value={restockReorderLevel}
                    onChange={(e) => setRestockReorderLevel(e.target.value)}
                    placeholder="Threshold level"
                  />
                </div>
              </div>

              {/* Delivery / Batch Ref */}
              <div className="sr-row-name-sku">
                <div className="pos-form-group" style={{ marginBottom: 0 }}>
                  <label className="pos-label">Batch / Shipment Code</label>
                  <input
                    type="text"
                    className="pos-input"
                    value={restockBatch}
                    onChange={(e) => setRestockBatch(e.target.value)}
                    placeholder="e.g. SHIP-2026-NOV"
                    style={{ fontFamily: 'monospace' }}
                  />
                </div>

                <div className="pos-form-group" style={{ marginBottom: 0 }}>
                  <label className="pos-label">Delivery Notes / Remarks</label>
                  <input
                    type="text"
                    className="pos-input"
                    value={restockNotes}
                    onChange={(e) => setRestockNotes(e.target.value)}
                    placeholder="e.g. From Paris distributor, undamaged"
                  />
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e8e2ee', paddingTop: '16px' }}>
            <button
              type="submit"
              className="action-btn-primary"
              disabled={isSubmitting}
              style={{
                padding: '10px 22px',
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              <span>
                {isSubmitting
                  ? 'Saving fragrance...'
                  : mode === 'new'
                  ? 'Save'
                  : `Confirm Restock (+${restockQty} units)`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
