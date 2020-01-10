import React from 'react';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import { AUTHORS } from './Authors';
import Loading from './Loading';
import Error from './Error';

const SetBirthYear = () => {
  const [name, setName] = React.useState('');
  const [born, setBorn] = React.useState('');
  const { loading, error, data } = useQuery(AUTHORS);
  const [setBornYear] = useMutation(ADD_BORN, {
    refetchQueries: [{ query: AUTHORS }],
  });

  const handleSubmit = async e => {
    e.preventDefault();
    const update = { name, born: Number(born) };
    await setBornYear({
      variables: update,
    });
  };

  if (error) return <Error error={error} />;
  if (loading) return <Loading />;

  const authors = data.allAuthors;

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: '1rem' }}>
          Author{' '}
          <select value={name} onChange={e => setName(e.target.value)}>
            {authors.map(a => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: 'block', marginBottom: '1rem' }}>
          Birth Year{' '}
          <input
            type="number"
            value={born}
            onChange={e => setBorn(e.target.value)}
          />
        </label>
        <button>update Author</button>
      </form>
    </div>
  );
};

export default SetBirthYear;

const ADD_BORN = gql`
  mutation setBirthYear($name: String!, $born: Int!) {
    editAuthor(name: $name, born: $born) {
      id
      name
      born
    }
  }
`;
