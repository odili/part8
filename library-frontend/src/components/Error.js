import React from 'react';

const Error = ({ error }) => {
  return (
    <div style={{ color: 'red', border: '1px solid red', padding: '.5rem' }}>
      {error}
    </div>
  );
};

export default Error;
