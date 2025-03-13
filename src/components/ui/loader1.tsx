import React from 'react';
import styled from 'styled-components';

const themeColors = ["#182422", "#164F45", "#1D7D6A", "#3CE7B2"];

const Loader1 = ({ className }: { className?: string }) => {
  return (
    <StyledWrapper className={className}>
      <div className="boxes">
        <div className="box"><div /><div /><div /><div /></div>
        <div className="box"><div /><div /><div /><div /></div>
        <div className="box"><div /><div /><div /><div /></div>
        <div className="box"><div /><div /><div /><div /></div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .boxes {
    --size: 32px;
    --duration: 800ms;
    height: calc(var(--size) * 2);
    width: calc(var(--size) * 3);
    position: relative;
    transform-style: preserve-3d;
    transform-origin: 50% 50%;
    margin-top: calc(var(--size) * -1.5);
    transform: rotateX(60deg) rotateZ(45deg);
  }

  .boxes .box {
    width: var(--size);
    height: var(--size);
    top: 0;
    left: 0;
    position: absolute;
    transform-style: preserve-3d;
  }

  .boxes .box:nth-child(1) { transform: translate(100%, 0); animation: box1 var(--duration) linear infinite; }
  .boxes .box:nth-child(2) { transform: translate(0, 100%); animation: box2 var(--duration) linear infinite; }
  .boxes .box:nth-child(3) { transform: translate(100%, 100%); animation: box3 var(--duration) linear infinite; }
  .boxes .box:nth-child(4) { transform: translate(200%, 0); animation: box4 var(--duration) linear infinite; }

  .boxes .box > div {
    --background: ${themeColors[2]};
    position: absolute;
    width: 100%;
    height: 100%;
    background: var(--background);
    transform: translateZ(calc(var(--size) / 2));
    box-shadow: 0 0 5px rgba(255, 255, 255, 0.5); /* Added shadow for better visibility */
  }

  .boxes .box > div:nth-child(1) { background: ${themeColors[0]}; }
  .boxes .box > div:nth-child(2) { background: ${themeColors[1]}; transform: rotateY(90deg); box-shadow: inset 0 0 5px rgba(255, 255, 255, 0.3); }
  .boxes .box > div:nth-child(3) { background: ${themeColors[2]}; transform: rotateX(-90deg); box-shadow: inset 0 0 5px rgba(255, 255, 255, 0.3); }
  .boxes .box > div:nth-child(4) { background: ${themeColors[3]}; transform: translateZ(calc(var(--size) * -3)); }

  @keyframes box1 { 0%, 50% { transform: translate(100%, 0); } 100% { transform: translate(200%, 0); } }
  @keyframes box2 { 0% { transform: translate(0, 100%); } 50% { transform: translate(0, 0); } 100% { transform: translate(100%, 0); } }
  @keyframes box3 { 0%, 50% { transform: translate(100%, 100%); } 100% { transform: translate(0, 100%); } }
  @keyframes box4 { 0% { transform: translate(200%, 0); } 50% { transform: translate(200%, 100%); } 100% { transform: translate(100%, 100%); } }
`;

export default Loader1;