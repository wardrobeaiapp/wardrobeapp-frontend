import styled from 'styled-components';
import { formTokens } from '../../../styles/tokens/forms';

export interface FormRowProps {
  /**
   * Number of columns in the grid
   * @default 2
   */
  columns?: number;
  /**
   * Gap between grid items
   * @default '1.5rem' (formTokens.spacing.lg)
   */
  gap?: string;
  /**
   * Stack columns on mobile
   * @default true
   */
  stackOnMobile?: boolean;
  /**
   * Additional class name
   */
  className?: string;
  /**
   * Inline styles
   */
  style?: React.CSSProperties;
  /**
   * Child elements
   */
  children: React.ReactNode;
}

const StyledFormRow = styled.div<Omit<FormRowProps, 'children'>>`
  display: grid;
  grid-template-columns: repeat(${({ columns = 2 }) => columns}, 1fr);
  gap: ${({ gap = formTokens.spacing.lg }) => gap};
  width: 100%;
  
  ${({ stackOnMobile = true }) => 
    stackOnMobile && `
      @media (max-width: ${formTokens.form.breakpoints.mobile}) {
        grid-template-columns: 1fr;
      }
    `
  }
`;

export const FormRow: React.FC<FormRowProps> = ({
  children,
  className,
  style,
  ...props
}) => {
  return (
    <StyledFormRow 
      className={`form-row ${className || ''}`.trim()}
      style={style}
      {...props}
    >
      {children}
    </StyledFormRow>
  );
};

FormRow.displayName = 'FormRow';

export default FormRow;
