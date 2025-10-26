import React from 'react';
import { ThreeDots } from 'react-loader-spinner';
import './Loader.css';

interface LoaderProps {
  fullPage?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ fullPage = false }) => {
  return (
    <div className={fullPage ? 'loader-fullpage' : 'loader-inline'}>
      <ThreeDots
        visible={true}
        height="80"
        width="80"
        color="#007bff"
        radius="9"
        ariaLabel="three-dots-loading"
      />
    </div>
  );
};

export const ButtonLoader: React.FC = () => {
  return (
    <ThreeDots
      visible={true}
      height="14"
      width="40"
      color="#ffffff"
      radius="9"
      ariaLabel="three-dots-loading"
    />
  );
};
