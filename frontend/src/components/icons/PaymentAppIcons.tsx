interface IconProps {
  className?: string;
  size?: number;
}

export function GPayIcon({ className = '', size = 32 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="48" height="48" rx="8" fill="white" />
      <path
        d="M24.5 20.5H33.5C33.8 21.6 34 22.8 34 24C34 29.5 30.3 34 24.5 34C19.3 34 15 29.7 15 24.5C15 19.3 19.3 15 24.5 15C27.1 15 29.4 16 31.1 17.7L28.3 20.5C27.3 19.6 26 19 24.5 19C21.5 19 19 21.5 19 24.5C19 27.5 21.5 30 24.5 30C27 30 29.1 28.4 29.8 26.2H24.5V20.5Z"
        fill="#4285F4"
      />
      <path
        d="M24.5 20.5V26.2H29.8C29.1 28.4 27 30 24.5 30C21.5 30 19 27.5 19 24.5C19 21.5 21.5 19 24.5 19C26 19 27.3 19.6 28.3 20.5L31.1 17.7C29.4 16 27.1 15 24.5 15C19.3 15 15 19.3 15 24.5C15 29.7 19.3 34 24.5 34C30.3 34 34 29.5 34 24C34 22.8 33.8 21.6 33.5 20.5H24.5Z"
        fill="#34A853"
        opacity="0"
      />
      <path
        d="M15 24.5C15 22.8 15.5 21.2 16.3 19.9L19.2 22.8C19.1 23.3 19 23.9 19 24.5C19 25.1 19.1 25.7 19.2 26.2L16.3 29.1C15.5 27.8 15 26.2 15 24.5Z"
        fill="#FBBC05"
      />
      <path
        d="M24.5 15C27.1 15 29.4 16 31.1 17.7L28.3 20.5C27.3 19.6 26 19 24.5 19C22.3 19 20.4 20.2 19.4 22L16.5 19.1C18.2 16.6 21.1 15 24.5 15Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function PhonePeIcon({ className = '', size = 32 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="48" height="48" rx="8" fill="#5F259F" />
      <path
        d="M32 16H28L22 22V16H18V32H22V26L28 32H32L25 24L32 16Z"
        fill="white"
      />
    </svg>
  );
}

export function PaytmIcon({ className = '', size = 32 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="48" height="48" rx="8" fill="#00BAF2" />
      <path
        d="M14 20H20V26H14V20Z"
        fill="white"
      />
      <path
        d="M22 14H28V34H22V14Z"
        fill="white"
      />
      <path
        d="M30 20H36V26H30V20Z"
        fill="white"
      />
    </svg>
  );
}
