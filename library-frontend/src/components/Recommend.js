import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import Loading from './Loading';
import Error from './Error';

const Recommend = props => {
  const { data: currentUser } = useQuery(USER);
  const { loading, error, data } = useQuery(BOOKS);

  if (error) return <Error error={error} />;
  if (loading) return <Loading />;
  const books = data.allBooks;
  let genres = books.reduce(
    (acc, cur) => {
      return [...acc, ...cur.genres];
    },
    ['refactoring']
  );

  genres = new Set(genres);
  // console.log(currentUser);

  if (!props.show) {
    return null;
  }

  return (
    <div>
      <h2>Recommendations</h2>
      <p>
        book(s) in your favorite <strong>{currentUser.me.favoriteGenre}</strong>
      </p>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books
            .filter(b => b.genres.includes(currentUser.me.favoriteGenre))
            .map(a => (
              <tr key={a.title}>
                <td>{a.title}</td>
                <td>{a.author.name}</td>
                <td>{a.published}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Recommend;

export const BOOKS = gql`
  {
    allBooks {
      id
      title
      author {
        name
        id
      }
      published
      genres
    }
  }
`;

const USER = gql`
  {
    me {
      id
      favoriteGenre
      username
    }
  }
`;
