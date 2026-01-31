import React from 'react';
import './Button.css';

interface ButtonProps {
  /**
   * Button text content
   */
  text: string;
  
  /**
   * Click event handler
   */
  onClick: () => void;
  
  /**
   * Whether the button is disabled
   */
  disabled?: boolean;
  
  /**
   * Button variant style
   */
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  
  /**
   * Button size
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Whether to show loading state
   */
  loading?: boolean;
  
  /**
   * Button icon
   */
  icon?: React.ReactNode;
}

/**
 * A reusable button component with various styles and states
 */
export const Button: React.FC<ButtonProps> = ({
  text,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  loading = false,
  icon
}) => {
  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  return (
    <button
      data-testid="button"
      className={`button button-${variant} button-${size} ${disabled || loading ? 'disabled' : ''}`}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
    >
      {loading && (
        <span className="loading-spinner" data-testid="loading-spinner">
          ⏳
        </span>
      )}
      {icon && !loading && (
        <span className="button-icon" data-testid="button-icon">
          {icon}
        </span>
      )}
      <span className="button-text" data-testid="button-text">
        {text}
      </span>
    </button>
  );
};

export default Button;