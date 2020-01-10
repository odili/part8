import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import Loading from './Loading';
import Error from './Error';
import SetBirthYear from './SetBirthYear';

const Authors = props => {
  const { loading, error, data } = useQuery(AUTHORS);
  if (!props.show) {
    return null;
  }
  if (error) return <Error error={error} />;
  if (loading) return <Loading />;
  const authors = data.allAuthors;

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map(a => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Set Brithyear</h2>
      <SetBirthYear />
    </div>
  );
};
export default Authors;

export const AUTHORS = gql`
  {
    allAuthors {
      id
      name
      born
      bookCount
    }
  }
`;
