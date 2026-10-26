import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/storage';
import { SEED_INSTITUTION, SEED_CAMPUS, SEED_LOCATIONS } from '../data/seedData';
import { Button } from '../components/common/Button';
import { 
  PlusCircle, 
  Upload, 
  Lock, 
  MapPin, 
  Calendar, 
  Clock, 
  Tag, 
  ShieldCheck, 
  Sparkles,
  Info
} from 'lucide-react';

const CATEGORIES = [
  'Electronics',
  'ID Cards & Documents',
  'Bags & Wallets',
  'Keys',
  'Books & Stationery',
  'Clothing & Accessories',
  'Jewellery',
  'Sports Equipment',
  'Other',
];

export const ReportLostPage: React.FC = () => {
  const navigate = useNavigate();
  const locations = db.getLocations();

  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [colour, setColour] = useState('');
  const [brand, setBrand] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventTime, setEventTime] = useState('14:00');
  const [locationId, setLocationId] = useState(locations[0]?.id || '');
  const [imagePreview, setImagePreview] = useState<string>('');
  
  // Private attributes (RLS protected)
  const [privateEngraving, setPrivateEngraving] = useState('');
  const [privateSerial, setPrivateSerial] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !description.trim() || !eventDate) return;

    setIsSubmitting(true);
    const selectedLoc = locations.find(l => l.id === locationId);

    const privateAttributes: Record<string, string> = {};
    if (privateEngraving.trim()) privateAttributes['custom_engraving'] = privateEngraving.trim();
    if (privateSerial.trim()) privateAttributes['serial_or_identifier'] = privateSerial.trim();

    const result = db.createReport({
      institution_id: SEED_INSTITUTION.id,
      campus_id: SEED_CAMPUS.id,
      report_type: 'lost',
      item_name: itemName.trim(),
      category,
      description: description.trim(),
      colour: colour.trim() || undefined,
      brand: brand.trim() || undefined,
      public_attributes: {},
      private_attributes: privateAttributes,
      event_date: eventDate,
      event_time: eventTime,
      location_id: locationId,
      location_name_cache: selectedLoc ? selectedLoc.name : 'Campus General Area',
      image_paths: imagePreview ? [imagePreview] : [],
    });

    setTimeout(() => {
      setIsSubmitting(false);
      // Redirect to AI Match Results or Item Detail
      if (result.matches.length > 0) {
        navigate(`/match-results/${result.report.id}`);
      } else {
        navigate(`/item/${result.report.id}`);
      }
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold mb-2 border border-rose-200">
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Lost Item Report</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy">Report a Lost Item</h1>
        <p className="text-xs sm:text-sm text-brand-secondary mt-1">
          Provide accurate details. The autonomous Multi-Agent System (MAS) will immediately scan all active found reports across campus upon submission.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 shadow-card border border-brand-border space-y-6">
        {/* Basic Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-secondary border-b border-brand-border pb-2">
            1. Core Item Details
          </h3>

          <div>
            <label className="block text-xs font-semibold text-brand-main mb-1">
              Item Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={itemName}
              onChange={e => setItemName(e.target.value)}
              placeholder="e.g. Apple AirPods Pro (2nd Gen) in white case"
              className="w-full text-xs rounded-lg border border-brand-border p-2.5 focus:ring-2 focus:ring-electric focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-main mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full text-xs rounded-lg border border-brand-border p-2.5 focus:ring-2 focus:ring-electric focus:outline-none bg-white"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-main mb-1">
                Primary Colour
              </label>
              <input
                type="text"
                value={colour}
                onChange={e => setColour(e.target.value)}
                placeholder="e.g. White, Black, Navy"
                className="w-full text-xs rounded-lg border border-brand-border p-2.5 focus:ring-2 focus:ring-electric focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-main mb-1">
                Brand / Manufacturer
              </label>
              <input
                type="text"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="e.g. Apple, Hydro Flask, Lenovo"
                className="w-full text-xs rounded-lg border border-brand-border p-2.5 focus:ring-2 focus:ring-electric focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-main mb-1">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe condition, contents, stickers, or cosmetic scratches..."
              className="w-full text-xs rounded-lg border border-brand-border p-2.5 focus:ring-2 focus:ring-electric focus:outline-none"
            />
          </div>
        </div>

        {/* Location & Time */}
        <div className="space-y-4 pt-4 border-t border-brand-border">
          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-secondary border-b border-brand-border pb-2">
            2. When & Where Was It Lost?
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-main mb-1">
                Date Lost <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={e => setEventDate(e.target.value)}
                className="w-full text-xs rounded-lg border border-brand-border p-2.5 focus:ring-2 focus:ring-electric focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-main mb-1">
                Approximate Time
              </label>
              <input
                type="time"
                value={eventTime}
                onChange={e => setEventTime(e.target.value)}
                className="w-full text-xs rounded-lg border border-brand-border p-2.5 focus:ring-2 focus:ring-electric focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-main mb-1">
              Campus Location / Building <span className="text-rose-500">*</span>
            </label>
            <select
              value={locationId}
              onChange={e => setLocationId(e.target.value)}
              className="w-full text-xs rounded-lg border border-brand-border p-2.5 focus:ring-2 focus:ring-electric focus:outline-none bg-white"
            >
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.building_or_area})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Private Verification Attributes (RLS protected) */}
        <div className="space-y-3 pt-4 border-t border-brand-border">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-secondary flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-accent-teal" />
              3. Private Verification Secrets (Optional)
            </h3>
            <span className="text-[10px] text-accent-teal-dark bg-accent-teal-light/50 px-2 py-0.5 rounded font-mono">
              RLS ENCRYPTED
            </span>
          </div>

          <p className="text-xs text-brand-secondary leading-relaxed">
            Details provided here will <strong>never</strong> be displayed in public search results. They are used exclusively by campus staff during ownership verification.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-main mb-1">
                Custom Engraving or Hidden Mark
              </label>
              <input
                type="text"
                value={privateEngraving}
                onChange={e => setPrivateEngraving(e.target.value)}
                placeholder="e.g. initials AC-2026, marker dot inside lid"
                className="w-full text-xs rounded-lg border border-brand-border p-2.5 focus:ring-2 focus:ring-electric focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-main mb-1">
                Serial Number / Identification Key
              </label>
              <input
                type="text"
                value={privateSerial}
                onChange={e => setPrivateSerial(e.target.value)}
                placeholder="e.g. Last 4 digits of serial, ID number"
                className="w-full text-xs rounded-lg border border-brand-border p-2.5 focus:ring-2 focus:ring-electric focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Photo Upload */}
        <div className="space-y-3 pt-4 border-t border-brand-border">
          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-secondary">
            4. Item Photo (Optional)
          </h3>

          <div className="flex items-center gap-4">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-border hover:bg-surface text-xs font-semibold text-brand-main transition-colors">
              <Upload className="w-4 h-4 text-electric" />
              <span>Select Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            <span className="text-xs text-brand-secondary">JPG, PNG or WEBP up to 5MB</span>
          </div>

          {imagePreview && (
            <div className="mt-3 relative w-36 h-36 rounded-xl overflow-hidden border border-brand-border shadow-xs">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setImagePreview('')}
                className="absolute top-1 right-1 bg-navy/80 text-white rounded-full p-1 text-[10px]"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-brand-border flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-brand-secondary">
            <Sparkles className="w-4 h-4 text-electric" />
            <span>Multi-Agent System will analyze this report immediately</span>
          </div>

          <Button
            type="submit"
            variant="secondary"
            size="lg"
            isLoading={isSubmitting}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Submit Lost Report
          </Button>
        </div>
      </form>
    </div>
  );
};
