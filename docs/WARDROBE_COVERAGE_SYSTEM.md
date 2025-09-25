# Wardrobe Coverage Calculation System

## Overview

The Wardrobe Coverage System calculates how many items a user needs in each wardrobe category (tops, bottoms, outerwear, accessories, etc.) based on their lifestyle scenarios and frequency of use. This data drives AI recommendations and gap analysis.

## Architecture

### Current Implementation
```
Frontend Services:
├── scenarioCoverageTriggerService.ts    # Triggers recalculation when items added/removed
├── category/
│   ├── calculations.ts                  # Core calculation logic (CURRENTLY USED)
│   ├── database.ts                      # Save/load coverage data
│   ├── queries.ts                       # AI analysis queries
│   └── index.ts                         # Main API exports

Backend Services (Legacy):
├── scenarioCoverageCalculator.js        # Outfit combination logic (UNUSED)
├── frequencyBasedNeedsCalculator.ts     # Smart outfit strategies (UNUSED)
└── scenarioCoverageTriggers.js          # Backend triggers (UNUSED)

Database:
└── wardrobe_coverage                    # Stores calculated coverage data
```

## How It Works

### 1. Triggering Recalculation

**When user adds/removes items:**
```typescript
// scenarioCoverageTriggerService.ts
triggerItemAddedCoverage(userId, items, scenarios, newItem, season)
├── For OUTERWEAR/ACCESSORY: Updates "All scenarios" (scenario-agnostic)
├── For other categories: Updates specific scenarios
└── Calls updateCategoryCoverage() for each affected scenario/season/category
```

### 2. Core Calculation Logic

**Main function:** `calculateCategoryCoverage()` in `calculations.ts`

```typescript
calculateCategoryCoverage(userId, scenarioId, scenarioName, frequency, season, category, items)
├── Filter items by category + season + wishlist status
├── Calculate outfit needs based on scenario frequency
├── Apply category-specific limits
├── Return CategoryCoverage object
```

**Frequency → Outfit Needs:**
```javascript
// From scenario frequency string to seasonal usage
parseFrequencyToSeasonalUse(frequency):
  - "daily" → 90 uses per season
  - "X times per week" → X × 13 uses per season  
  - "X times per month" → X × 3 uses per season
  - default → 5 uses per season

// Convert usage to outfit needs
calculateOutfitNeeds(usesPerSeason):
  - If ≤1 use/week: Math.ceil(usesPerSeason / 4)
  - If >1 use/week: Math.ceil(usesPerWeek × 2)
```

### 3. Category-Specific Logic

**Regular Categories (TOP, BOTTOM, FOOTWEAR):**
- Calculate `outfitsNeeded` from frequency
- Apply category multipliers
- Set min/ideal/max targets

**Accessories (Special Handling):**
- **Scenario-agnostic** (same needs across all scenarios)
- **Subcategory breakdown** (separate records for Bag, Belt, Jewelry, etc.)
- **Lifestyle multipliers:**
  ```javascript
  'Bag': { ideal: Math.ceil(outfitsNeeded × 0.1), max: 6 }
  'Jewelry': { ideal: Math.ceil(outfitsNeeded × 0.4), max: 999 }
  'Belt': { ideal: Math.ceil(outfitsNeeded × 0.2), max: 8 }
  ```

**Outerwear:**
- **Scenario-agnostic** (like accessories)
- Season-specific calculations
- Indoor/outdoor lifestyle not currently considered

### 4. Database Storage

**Table:** `wardrobe_coverage`
```sql
- user_id: UUID
- scenario_id: UUID (null for scenario-agnostic categories)
- scenario_name: string ("All scenarios" for outerwear/accessories)
- season: string ('spring/fall', 'summer', 'winter')
- category: string ('top', 'bottom', 'outerwear', 'accessory')
- subcategory: string (only for accessories: 'Bag', 'Belt', etc.)
- current_items: integer (ACTUAL count from wardrobe_items)
- needed_items_min: integer
- needed_items_ideal: integer  
- needed_items_max: integer
- coverage_percent: integer (current/ideal × 100, capped at 100%)
- gap_count: integer (ideal - current, minimum 0)
- is_critical: boolean (current < needed_min)
```

## Current Issues & Limitations

### ❌ Remaining Issues

1. **No Outfit Combination Logic** ⚠️ **DESIGN CHOICE** 
   - Calculates each category independently
   - Doesn't account for: 1 dress = 1 outfit (no bottom needed)
   - Doesn't follow "more tops than bottoms" principle
   - **Note:** May be intentionally simple for user understanding

### ✅ Recently Fixed Problems

2. **No Lifestyle Adjustment** ✅ **FIXED WITH LIFESTYLE-BASED SYSTEM**
   - ~~Work-from-home person gets same outerwear/bag targets as office commuter~~
   - ~~Indoor vs outdoor lifestyle not considered~~
   - ~~All users get identical multipliers~~
   - **Now:** Ultra-simple binary detection (indoor vs outdoor) with realistic targets

3. **Unrealistic Minimum Values** ✅ **FIXED**
   - ~~Hardcoded `neededItemsMin: 0` for accessories ignored lifestyle logic~~
   - ~~Ridiculous "0 minimum bags" for office workers~~
   - **Now:** Proper minimum values (min: 3 bags for everyone, higher ideals by lifestyle)

4. **Performance Issues** ✅ **FIXED** 
   - ~~Redundant lifestyle calculations on every coverage update~~
   - **Now:** Caching system prevents duplicate analysis during bulk updates

5. **Wishlist Item Issues** ✅ **PREVIOUSLY FIXED**
   - ~~Coverage calculations included wishlist items~~
   - ~~Mismatch between UI (wardrobe only) and analysis (wardrobe + wishlist)~~

### ✅ What Works Well

1. **Efficient Updates**
   - Only recalculates affected categories when items change
   - Scenario-agnostic approach for outerwear/accessories
   - **NEW:** Lifestyle analysis caching prevents redundant calculations

2. **Subcategory Breakdown**
   - Accessories split into meaningful subcategories (Bag, Belt, Jewelry)
   - Allows fine-grained analysis

3. **Realistic Lifestyle-Based Targets** ✅ **NEW**
   - Binary indoor/outdoor detection with 90% confidence
   - Seasonal outerwear integration (spring/fall needs variety)  
   - Common-sense minimums (min: 3 bags for everyone)
   - Higher variety targets for outdoor-focused users

4. **Performance Optimized** ✅ **NEW**
   - Ultra-simple binary detection (no complex scoring)
   - Caching prevents duplicate lifestyle analysis
   - Fixed hardcoded bugs that ignored lifestyle logic

3. **AI Integration**
   - Coverage data available for AI analysis
   - Gap analysis drives recommendations

## Alternative Systems (Unused)

### Smart Outfit Strategy System (`frequencyBasedNeedsCalculator.ts`)

**Better approach that accounts for outfit combinations:**
```typescript
// Calculates actual outfit possibilities
topBottomOutfits = Math.min(currentItems.top, currentItems.bottom)
onePieceOutfits = currentItems.one_piece  
totalOutfits = topBottomOutfits + onePieceOutfits

// Multiple wardrobe strategies
outfitStrategies: {
  separatesFocused: { tops: 90%, bottoms: 70% },
  dressFocused: { one_piece: 60%, tops: 30% },
  balanced: { tops: 60%, bottoms: 40%, one_piece: 30% }
}
```

**Why not used:** More complex, harder to maintain

### Outfit Combination Calculator (`scenarioCoverageCalculator.js`)

**Advanced logic for complete outfits:**
```javascript
// Considers footwear requirements
if (tops.length > 0 && bottoms.length > 0 && footwear.length > 0) {
  totalOutfits = tops.length × bottoms.length;
}

// Identifies bottlenecks
if (footwear.length === 0) {
  bottleneck = 'footwear';
  missingForNextOutfit = 'Adding appropriate footwear would unlock outfit combinations';
}
```

**Why not used:** Backend-focused, not integrated with frontend

## How to Modify the System

### Adding Lifestyle Adjustments

**Current priority:** Indoor vs Outdoor lifestyle for outerwear/accessories

**Implementation options:**

1. **In Calculations (`calculations.ts`):**
   ```typescript
   // Add lifestyle detection
   const isIndoorFocused = detectIndoorLifestyle(scenarios);
   const lifestyleMultiplier = isIndoorFocused ? 0.3 : 1.0;
   
   // Apply to outerwear/accessories
   if (category === ItemCategory.OUTERWEAR || category === ItemCategory.ACCESSORY) {
     ideal = Math.ceil(baseIdeal × lifestyleMultiplier);
   }
   ```

2. **In AI Prompt (easier):**
   ```javascript
   // Add lifestyle context to AI analysis
   systemPrompt += `\nLIFESTYLE: Indoor-focused (work from home)
   TARGET FOR BAGS: 1-2 total (you have: ${currentBags})
   PRIORITY: LOW - you rarely need bags for daily activities`;
   ```

### Adding Outfit Combination Logic

**Replace current independent calculations with smart combinations:**

```typescript
// Instead of calculating tops/bottoms separately
const topBottomCombinations = Math.min(currentTops, currentBottoms);
const dressCombinations = currentDresses;
const totalOutfits = topBottomCombinations + dressCombinations;

// Recommend based on total outfit gap, not category gaps
if (totalOutfits < targetOutfits) {
  // Recommend more versatile items (tops over bottoms, dresses over separates)
}
```

### Modifying Category Limits

**Update accessory multipliers in `getAccessorySubcategoryLimits()`:**
```javascript
// Current
'Bag': { ideal: Math.ceil(outfitsNeeded × 0.1), max: 6 }

// Modified for lifestyle
'Bag': { 
  ideal: Math.ceil(outfitsNeeded × (isIndoorFocused ? 0.05 : 0.15)), 
  max: isIndoorFocused ? 3 : 6 
}
```

## Testing & Debugging

### Key Files for Debugging
```bash
# View current coverage data
SELECT * FROM wardrobe_coverage WHERE user_id = 'YOUR_USER_ID';

# Test recalculation
# Add/remove item → Check coverage updates

# Debug calculations
console.log() in calculations.ts → calculateCategoryCoverage()
```

### Common Issues
1. **Coverage shows 0 items:** Check wishlist filtering logic
2. **Weird high numbers:** Check frequency parsing + outfit needs calculation  
3. **Coverage not updating:** Check trigger service + database saves

## Future Improvements

1. **✅ HIGH PRIORITY:** Add indoor/outdoor lifestyle adjustment
2. **✅ MEDIUM:** Integrate outfit combination logic  
3. **LOW:** Migrate to smarter calculation system
4. **LOW:** Add seasonal climate adjustments (tropical vs cold climates)

---

*Last Updated: 2025-09-24*
*Current System: Frontend category-based calculations (`calculations.ts`)*
