import React from 'react';

interface EpochDividerProps {
  epochNumber: string;
}

export const EpochDivider: React.FC<EpochDividerProps> = ({ epochNumber }) => {
  return (
    <div className="flex items-center my-4 px-4">
      <div className="flex-grow border-t border-blue-300"></div>
      <div className="mx-4 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full border border-blue-200">
        Epoch {epochNumber}
      </div>
      <div className="flex-grow border-t border-blue-300"></div>
    </div>
  );
};