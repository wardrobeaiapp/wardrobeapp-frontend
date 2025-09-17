// AI extraction service using shared wardrobe options

import type { ExtractedAttributes } from './types';
import { COLOR_OPTIONS, STYLE_OPTIONS, getSilhouetteOptionsForCategory } from '../../../constants/wardrobeOptions';

export class ExtractionService {
  
  /**
   * Generate AI prompt for extracting structured attributes
   */
  generateExtractionPrompt(category: string, subcategory?: string): string {
    const silhouetteOptions = this.getSilhouetteOptionsForCategory(category);
    
    return `
EXTRACT STRUCTURED DATA - You must select from the exact options below.

CRITICAL: Only select from these predefined lists. Do not create new options.

COLOR (select exactly one):
${COLOR_OPTIONS.join(', ')}

${silhouetteOptions.length > 0 ? `SILHOUETTE (select exactly one):
${silhouetteOptions.join(', ')}` : 'SILHOUETTE: Not applicable for this category'}

STYLE (select exactly one):
${STYLE_OPTIONS.join(', ')}

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:
color: [your selection]
silhouette: [your selection or 'N/A' if not applicable]
style: [your selection]

RULES:
- You MUST select from the lists above - no other options allowed
- Use exact capitalization as shown in the lists
- If uncertain, select the closest match
- For silhouette, use 'N/A' if the category doesn't have silhouette options
- Do not add explanations or additional text
`;
  }
  
  /**
   * Parse AI response into structured attributes
   */
  parseExtractionResponse(response: string, category: string): ExtractedAttributes | null {
    try {
      const lines = response.split('\n').map(line => line.trim()).filter(line => line);
      
      let color = '';
      let silhouette = '';
      let style = '';
      
      for (const line of lines) {
        if (line.startsWith('color:')) {
          color = line.replace('color:', '').trim();
        } else if (line.startsWith('silhouette:')) {
          silhouette = line.replace('silhouette:', '').trim();
        } else if (line.startsWith('style:')) {
          style = line.replace('style:', '').trim();
        }
      }
      
      // Validate extracted values
      const validatedColor = this.validateColor(color);
      const validatedSilhouette = this.validateSilhouette(silhouette, category);
      const validatedStyle = this.validateStyle(style);
      
      if (!validatedColor || !validatedStyle) {
        return null;
      }
      
      return {
        color: validatedColor,
        silhouette: validatedSilhouette,
        style: validatedStyle,
        confidence: {
          color: this.calculateConfidence(color, validatedColor),
          silhouette: this.calculateConfidence(silhouette, validatedSilhouette),
          style: this.calculateConfidence(style, validatedStyle)
        }
      };
      
    } catch (error) {
      console.error('Failed to parse extraction response:', error);
      return null;
    }
  }
  
  /**
   * Get silhouette options for specific category
   */
  private getSilhouetteOptionsForCategory(category: string): string[] {
    return getSilhouetteOptionsForCategory(category);
  }
  
  /**
   * Validate and normalize color selection
   */
  private validateColor(color: string): string | null {
    if (!color || color === 'N/A') return null;
    
    // Find exact match
    const exactMatch = COLOR_OPTIONS.find(option => 
      option.toLowerCase() === color.toLowerCase()
    );
    if (exactMatch) return exactMatch;
    
    // Find partial match
    const partialMatch = COLOR_OPTIONS.find(option => 
      option.toLowerCase().includes(color.toLowerCase()) ||
      color.toLowerCase().includes(option.toLowerCase())
    );
    
    return partialMatch || null;
  }
  
  /**
   * Validate and normalize silhouette selection
   */
  private validateSilhouette(silhouette: string | null, category: string): string | null {
    if (!silhouette || silhouette === 'N/A') return null;
    
    const silhouetteOptions = this.getSilhouetteOptionsForCategory(category);
    
    if (silhouetteOptions.length === 0) return null;
    
    // Find exact match
    const exactMatch = silhouetteOptions.find(option => 
      option.toLowerCase() === silhouette.toLowerCase()
    );
    if (exactMatch) return exactMatch;
    
    // Find partial match
    const partialMatch = silhouetteOptions.find(option => 
      option.toLowerCase().includes(silhouette.toLowerCase()) ||
      silhouette.toLowerCase().includes(option.toLowerCase())
    );
    
    return partialMatch || null;
  }
  
  /**
   * Validate and normalize style selection
   */
  private validateStyle(style: string): string | null {
    if (!style || style === 'N/A') return null;
    
    // Find exact match
    const exactMatch = STYLE_OPTIONS.find(option => 
      option.toLowerCase() === style.toLowerCase()
    );
    if (exactMatch) return exactMatch;
    
    // Find partial match
    const partialMatch = STYLE_OPTIONS.find(option => 
      option.toLowerCase().includes(style.toLowerCase()) ||
      style.toLowerCase().includes(option.toLowerCase())
    );
    
    return partialMatch || null;
  }
  
  /**
   * Calculate confidence score for extraction
   */
  private calculateConfidence(original: string | null, validated: string | null): number {
    if (!validated || !original) return 0;
    if (original.toLowerCase() === validated.toLowerCase()) return 95;
    if (validated.toLowerCase().includes(original.toLowerCase())) return 85;
    if (original.toLowerCase().includes(validated.toLowerCase())) return 80;
    return 70;
  }
}
