import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { Season, ItemCategory } from "../../../../../types";
import {
  DetectedTags,
  FormAutoPopulationService
} from "../../../../../services/ai/formAutoPopulation";
import { FormField } from "../../../../../services/ai/formAutoPopulation/types";
import { Modal } from "../../../../common/Modal";
import {
  FormField as FormFieldComponent,
  FormSelect,
  CheckboxGroup,
} from "../../../../common/Form";
import {
  getSubcategoryOptions,
  formatCategoryName,
} from "../../../../features/wardrobe/forms/WardrobeItemForm/utils/formHelpers";

// Styled components
const AICheckModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  .image-preview {
    width: 100%;
    height: 300px;
    border-radius: 8px;
    overflow: hidden;
    background-color: ${({ theme }) => theme.colors.backgroundSecondary};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;

    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .no-image {
      color: ${({ theme }) => theme.colors.textSecondary};
      padding: 1rem;
      text-align: center;
    }
  }
`;

interface AICheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: {
    category: string;
    subcategory: string;
    seasons: string[];
  }) => void;
  imageUrl: string;
  onFetchTags?: (imageUrl: string) => Promise<DetectedTags | null>;
}

// Get all category options from ItemCategory enum
const categories = Object.values(ItemCategory).map((category) => ({
  value: category,
  label: formatCategoryName(category),
}));

// Get subcategory options based on selected category
const getSubcategorySelectOptions = (category: ItemCategory | "") => {
  if (!category) return [];
  const subcategories = getSubcategoryOptions(category);
  return subcategories.map((subcategory) => ({
    value: subcategory.charAt(0).toUpperCase() + subcategory.slice(1).toLowerCase(),
    label: subcategory,
  }));
};

const AICheckModal: React.FC<AICheckModalProps> = ({
  isOpen,
  onClose,
  onApply,
  imageUrl,
  onFetchTags,
}) => {
  // We'll use the tags directly without storing them in state
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const hasFetchedRef = useRef(false);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    setSubcategory(""); // Reset subcategory when category changes
  };

  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('[AICheckModal] Setting subcategory manually to:', e.target.value);
    setSubcategory(e.target.value);
  };

  // Using setSelectedSeasons directly with CheckboxGroup instead of a toggle function

  const handleApply = () => {
    onApply({
      category,
      subcategory,
      seasons: selectedSeasons,
    });
    onClose();
  };

  // We're using FormAutoPopulationService.autoPopulateFromTags instead of manual processing

  // Fetch tags from image when modal opens
  useEffect(() => {
    // Define an async function to fetch and process tags
    const fetchAndProcessTags = async () => {
      // Only fetch if modal is open, we have an image URL, onFetchTags exists, and we haven't already fetched
      if (isOpen && imageUrl && onFetchTags && !hasFetchedRef.current) {
        try {
          console.log("[AICheckModal] Fetching tags for image...");
          hasFetchedRef.current = true; // Mark as fetched to prevent repeated calls

          const tags = await onFetchTags(imageUrl);
          if (tags) {
            console.log("[AICheckModal] Extracted tags:", tags);
            console.log("[AICheckModal] Checking for category/subcategory tags:", 
              Object.entries(tags).filter(([k]) => k.toLowerCase().includes('category') || k.toLowerCase().includes('type')));

            // Use the static method exactly as in WardrobeItemForm
            await FormAutoPopulationService.autoPopulateFromTags(
              tags,
              {
                // Only provide the setters we need in AICheckModal
                setCategory: setCategory,
                // Convert subcategory value to uppercase with underscores to match the select options format
                setSubcategory: (value: string) => {
                  if (!value) return;
                  console.log('[AICheckModal] Received subcategory from service:', value);
                  const formattedValue = value.toUpperCase().replace(/\s+/g, '_');
                  console.log('[AICheckModal] Formatted subcategory for select:', formattedValue);
                  setSubcategory(formattedValue);
                },
                // For seasons we need a toggleSeason function that works with CheckboxGroup
                toggleSeason: (season: string) => {
                  setSelectedSeasons(prev => {
                    if (prev.includes(season)) {
                      return prev.filter(s => s !== season);
                    } else {
                      return [...prev, season];
                    }
                  });
                }
              },
              {
                overwriteExisting: false,
                // Skip fields that don't exist in AICheckModal to avoid log spam
                skipFields: [
                  FormField.NAME,
                  FormField.COLOR,
                  FormField.PATTERN,
                  FormField.MATERIAL,
                  FormField.BRAND,
                  FormField.SIZE,
                  FormField.STYLE,
                  FormField.SILHOUETTE,
                  FormField.LENGTH,
                  FormField.SLEEVES,
                  FormField.RISE,
                  FormField.NECKLINE,
                  FormField.HEEL_HEIGHT,
                  FormField.BOOT_HEIGHT,
                  FormField.TYPE
                  // Note: We're NOT skipping SUBCATEGORY, so it can be auto-populated
                ]
              }
            );
          }
        } catch (error) {
          console.error("[AICheckModal] Error fetching tags:", error);
        }
      }
    };

    // Run fetch logic when modal opens
    if (isOpen) {
      fetchAndProcessTags();
    } else {
      // Reset ref when modal closes for next time it opens
      hasFetchedRef.current = false;
    }

    // Including all dependencies to satisfy ESLint
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, imageUrl, onFetchTags]);

  const filteredSubcategories = getSubcategorySelectOptions(
    category as ItemCategory,
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Check Settings"
      size="md"
      actions={[
        {
          label: "Cancel",
          onClick: onClose,
          variant: "secondary",
          fullWidth: true,
        },
        {
          label: "Apply",
          onClick: handleApply,
          variant: "primary",
          fullWidth: true,
        },
      ]}
    >
      <AICheckModalContainer>
        <div className="image-preview">
          {imageUrl ? (
            <img src={imageUrl} alt="Item to check" />
          ) : (
            <div className="no-image">No image selected</div>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <FormFieldComponent label="Category">
            <FormSelect
              value={category}
              onChange={handleCategoryChange}
              style={{ width: "100%" }}
            >
              <option value="">Select category</option>
              {categories.map((cat) => {
                // Skip the 'OTHER' category as it's not relevant for AI checking
                if (cat.value === ItemCategory.OTHER) return null;
                return (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                );
              })}
            </FormSelect>
          </FormFieldComponent>

          <FormFieldComponent label="Subcategory">
            <FormSelect
              value={subcategory}
              onChange={handleSubcategoryChange}
              disabled={!category}
              style={{ width: "100%" }}
            >
              <option value="">
                {category ? "Select subcategory" : "Select category"}
              </option>
              {filteredSubcategories.map((sub) => (
                <option key={sub.value} value={sub.value}>
                  {sub.label}
                </option>
              ))}
            </FormSelect>
          </FormFieldComponent>
        </div>

        <FormFieldComponent label="Seasons">
          <CheckboxGroup
            options={(Object.values(Season) as string[]).map((season) => ({
              value: season,
              label:
                  season === "FALL"
                    ? "Fall"
                    : season.charAt(0).toUpperCase() +
                      season.slice(1).toLowerCase(),
              }))}
            value={selectedSeasons}
            onChange={setSelectedSeasons}
            direction="row"
          />
        </FormFieldComponent>
      </AICheckModalContainer>
    </Modal>
  );
};

export default AICheckModal;
