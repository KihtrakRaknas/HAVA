import styled from "styled-components";

export const Body = styled.div`
  align-items: center;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 40px;
`;


export const BodyContainer = styled.div`
  align-items: center;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 40px;
  width: 400px;
`;

export const Button = styled.button`
  background-color: white;
  border: none;
  border-radius: 8px;
  color: #282c34;
  cursor: pointer;
  margin: 0 20px 0 0;
  padding: 12px 24px;
  text-align: center;
  text-decoration: none;
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh);
`;

export const Header = styled.header`
  align-items: center;
  background-color: #282c34;
  color: white;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  min-height: 70px;
`;

export const Image = styled.img`
  height: 40vmin;
  margin-bottom: 16px;
  pointer-events: none;
`;

export const Link = styled.a.attrs({
  target: "_blank",
  rel: "noopener noreferrer",
})`
  color: #61dafb;
  margin-top: 8px;
`;

export const Input = styled.input`
  width: 50px;
  text-align: center;
  background: white;
  font-size: 16px;
  border: none;
  margin: 0 2px;
`;
