import styled from 'styled-components';

const SeasonTag = styled.span`
  display: inline-block;
  border-radius: 0.25rem;
  padding: 0.2rem 0.5rem;
  font-size: 0.7rem;
  text-transform: capitalize;
  line-height: 1.2;
  font-weight: 500;
  
  &[data-season="fall"],
  &[data-season="autumn"] {
    background-color: #dbe9fe;
    color: #5975c8;
  }
  
  &[data-season="spring"] {
    background-color: #dcfce6;
    color: #3d8155;
  }
  
  &[data-season="summer"] {
    background-color: #fef9c3;
    color: #9e7136;
  }
  
  &[data-season="winter"] {
    background-color: #cefafe;
    color: #3f7f92;
  }
`;

export { SeasonTag };
export default SeasonTag;
