import { 
  FaLaptop, 
  FaHome, 
  FaWalking, 
  FaUsers, 
  FaCalendarAlt, 
  FaGlassCheers, 
  FaPlane, 
  FaHeart, 
  FaGraduationCap, 
  FaBriefcase, 
  FaPaintBrush, 
  FaTools, 
  FaRunning 
} from 'react-icons/fa';

export interface ScenarioIconConfig {
  Icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

/**
 * Get the appropriate icon configuration for a scenario type
 * @param scenarioType The type of scenario
 * @returns Icon component, color, and background color
 */
export const getScenarioIcon = (scenarioType: string | undefined): ScenarioIconConfig => {
  // Return default icon if scenarioType is undefined or null
  if (!scenarioType) {
    return {
      Icon: FaCalendarAlt,
      color: '#6b7280',
      bgColor: '#f3f4f6'
    };
  }
  
  try {
    // Convert to lowercase and remove any spaces for consistent matching
    const type = scenarioType.toLowerCase().replace(/\s+/g, '');
    
    // Use includes instead of exact matching to be more flexible
    if (type.includes('office')) {
      return {
        Icon: FaBriefcase,
        color: '#4285f4',
        bgColor: '#e8f0fe'
      };
    } else if (type.includes('remote') || type.includes('work')) {
      return {
        Icon: FaLaptop,
        color: '#34a853',
        bgColor: '#e6f4ea'
      };
    } else if (type.includes('social') || type.includes('party') || type.includes('event') || type.includes('outing')) {
      return {
        Icon: FaUsers,
        color: '#f59e0b',
        bgColor: '#fff8f0'
      };
    } else if (type.includes('workout') || type.includes('gym') || type.includes('exercise') || type.includes('fitness')) {
      return {
        Icon: FaRunning,
        color: '#ef4444',
        bgColor: '#fee2e2'
      };
    } else if (type.includes('casual') || type.includes('weekend') || type.includes('leisure') || type.includes('staying') || type.includes('home') || type.includes('housekeeping')) {
      return {
        Icon: FaHome,
        color: '#10b981',
        bgColor: '#f0fff4'
      };
    } else if (type.includes('outdoor') || type.includes('activity')) {
      return {
        Icon: FaWalking,
        color: '#059669',
        bgColor: '#ecfdf5'
      };
    } else if (type.includes('travel') || type.includes('vacation') || type.includes('trip')) {
      return {
        Icon: FaPlane,
        color: '#8b5cf6',
        bgColor: '#f8f0ff'
      };
    } else if (type.includes('date') || type.includes('romantic')) {
      return {
        Icon: FaHeart,
        color: '#f06292',
        bgColor: '#ffebee'
      };
    } else if (type.includes('school') || type.includes('university') || type.includes('student') || type.includes('study')) {
      return {
        Icon: FaGraduationCap,
        color: '#a142f4',
        bgColor: '#f3e8fd'
      };
    } else if (type.includes('family') || type.includes('care')) {
      return {
        Icon: FaHeart,
        color: '#f06292',
        bgColor: '#ffebee'
      };
    } else if (type.includes('creative')) {
      return {
        Icon: FaPaintBrush,
        color: '#fbbc04',
        bgColor: '#fff8e1'
      };
    } else if (type.includes('physical')) {
      return {
        Icon: FaTools,
        color: '#ea4335',
        bgColor: '#fce8e6'
      };
    } else if (type.includes('formal')) {
      return {
        Icon: FaGlassCheers,
        color: '#f59e0b',
        bgColor: '#fff8f0'
      };
    } else {
      console.log(`No icon match for: ${scenarioType} (normalized: ${type})`);
      return {
        Icon: FaCalendarAlt,
        color: '#6b7280',
        bgColor: '#f3f4f6'
      };
    }
  } catch (error) {
    console.error('Error in getScenarioIcon:', error);
    return {
      Icon: FaCalendarAlt,
      color: '#6b7280',
      bgColor: '#f3f4f6'
    };
  }
};
