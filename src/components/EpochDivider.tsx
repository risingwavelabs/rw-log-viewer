import React from 'react';

interface EpochDividerProps {
  epochNumber: string;
}

export const EpochDivider: React.FC<EpochDividerProps> = ({ epochNumber }) => {
  return (
    <div className="flex items-center my-6 px-6">
      <div className="flex-grow border-t-2 border-gradient-to-r from-blue-300 to-indigo-300"></div>
      <div className="mx-6 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-sm font-bold rounded-full border border-blue-300 shadow-sm flex items-center">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Epoch {epochNumber}
      </div>
      <div className="flex-grow border-t-2 border-gradient-to-r from-indigo-300 to-blue-300"></div>
    </div>
  );
};