import React from 'react';
import { useMutation } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';

const Login = props => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  const [userLogin] = useMutation(LOGIN);

  const submit = async e => {
    e.preventDefault();
    const result = await userLogin({
      variables: { username, password },
    });
    if (result) {
      const token = result.data.login.value;
      // props.setToken(token);
      window.localStorage.setItem('library-user', token);
    }
    props.setPage();
    setUsername('');
    setPassword('');
  };
  if (!props.show) {
    return null;
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          username
          <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password
          <input
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>

        <button type="submit">login</button>
      </form>
    </div>
  );
};

export default Login;

const LOGIN = gql`
  mutation userLogin($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`;
