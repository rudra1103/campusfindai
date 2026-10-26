import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/storage';
import { SEED_INSTITUTION, SEED_CAMPUS } from '../data/seedData';
import { Button } from '../components/common/Button';
import { CustodyStatus } from '../types';
import { 
  PlusCircle, 
  Upload, 
  ShieldAlert, 
  Lock, 
  Sparkles,
  MapPin, 
  Calendar,
  Building
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

export const ReportFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const locations = db.getLocations();

  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [colour, setColour] = useState('');
  const [brand, setBrand] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventTime, setEventTime] = useState('14:30');
  const [locationId, setLocationId] = useState(locations[0]?.id || '');
  const [custodyStatus, setCustodyStatus] = useState<CustodyStatus>('reporter_custody');
  const [safeHandoverLocation, setSafeHandoverLocation] = useState('Campus Safety Dispatch Office');
  const [imagePreview, setImagePreview] = useState<string>('');
  
  // Private attribute
  const [privateTrait, setPrivateTrait] = useState('');
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
    if (privateTrait.trim()) privateAttributes['hidden_trait'] = privateTrait.trim();

    const result = db.createReport({
      institution_id: SEED_INSTITUTION.id,
      campus_id: SEED_CAMPUS.id,
      report_type: 'found',
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
      custody_status: custodyStatus,
      safe_handover_location: safeHandoverLocation,
    });

    setTimeout(() => {
      setIsSubmitting(false);
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2 border border-emerald-200">
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Found Item Report</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy">Report a Found Item</h1>
        <p className="text-xs sm:text-sm text-brand-secondary mt-1">
          Thank you for being a good campus citizen! Help reunite this item with its rightful owner safely.
        </p>
      </div>

      {/* Sensitive Item Privacy Banner */}
      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-amber-950 mb-0.5">Privacy & Theft Protection Notice</h4>
          <p className="leading-relaxed">
            Do not publicly reveal full identification numbers, dates of birth, or confidential details printed on student IDs or cards. Withhold one or two unique traits to verify the rightful claimant during handover.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 shadow-card border border-brand-border space-y-6">
        {/* Core Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-secondary border-b border-brand-border pb-2">
            1. What Did You Find?
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
              placeholder="e.g. Blue Hydro Flask or AirPods Case"
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
                placeholder="e.g. Blue, Black, Silver"
                className="w-full text-xs rounded-lg border border-brand-border p-2.5 focus:ring-2 focus:ring-electric focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-main mb-1">
                Brand / Make
              </label>
              <input
                type="text"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="e.g. Hydro Flask, Apple, Nike"
                className="w-full text-xs rounded-lg border border-brand-border p-2.5 focus:ring-2 focus:ring-electric focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-main mb-1">
              Public Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe what was found without revealing secret passcodes or private ID numbers..."
              className="w-full text-xs rounded-lg border border-brand-border p-2.5 focus:ring-2 focus:ring-electric focus:outline-none"
            />
          </div>
        </div>

        {/* Location & Time */}
        <div className="space-y-4 pt-4 border-t border-brand-border">
          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-secondary border-b border-brand-border pb-2">
            2. When & Where Was It Found?
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-main mb-1">
                Date Found <span className="text-rose-500">*</span>
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
              Found Location / Building <span className="text-rose-500">*</span>
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

        {/* Custody & Safe Handover */}
        <div className="space-y-4 pt-4 border-t border-brand-border">
          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-secondary border-b border-brand-border pb-2">
            3. Current Custody & Safe Handover
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-main mb-1">
                Where is the item right now? <span className="text-rose-500">*</span>
              </label>
              <select
                value={custodyStatus}
                onChange={e => setCustodyStatus(e.target.value as CustodyStatus)}
                className="w-full text-xs rounded-lg border border-brand-border p-2.5 focus:ring-2 focus:ring-electric focus:outline-none bg-white"
              >
                <option value="reporter_custody">I have it in my possession</option>
                <option value="campus_security">Handed to Campus Safety / Security Desk</option>
                <option value="lost_and_found_office">Turned into Main Lost & Found Office</option>
                <option value="department_desk">Left at Building / Department Front Desk</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-main mb-1">
                Safe Handover Point
              </label>
              <input
                type="text"
                value={safeHandoverLocation}
                onChange={e => setSafeHandoverLocation(e.target.value)}
                placeholder="e.g. Student Union Front Desk, Campus Safety Office"
                className="w-full text-xs rounded-lg border border-brand-border p-2.5 focus:ring-2 focus:ring-electric focus:outline-none"
              />
            </div>
          </div>

          {/* Withheld Verification Trait */}
          <div className="bg-slate-50 p-3 rounded-xl border border-brand-border space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
              <Lock className="w-3.5 h-3.5 text-accent-teal" />
              Withheld Verification Detail (Hidden from public)
            </label>
            <input
              type="text"
              value={privateTrait}
              onChange={e => setPrivateTrait(e.target.value)}
              placeholder="e.g. item has a secret sticker, engraving initials, color of pouch"
              className="w-full text-xs rounded-lg border border-brand-border p-2.5 bg-white focus:ring-2 focus:ring-electric focus:outline-none"
            />
            <p className="text-[11px] text-brand-secondary">
              Campus moderators will use this to confirm the claimant is the actual owner.
            </p>
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
            <span className="text-xs text-brand-secondary">Do not upload photos showing sensitive ID numbers</span>
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

        {/* Submit Action */}
        <div className="pt-4 border-t border-brand-border flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-brand-secondary">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Coordinator Agent will scan for active lost reports</span>
          </div>

          <Button
            type="submit"
            variant="success"
            size="lg"
            isLoading={isSubmitting}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Submit Found Report
          </Button>
        </div>
      </form>
    </div>
  );
};
