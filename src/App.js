import {
  Container,
  NumberInput,
  Group,
  TextInput,
  Button,
  Table,
  Alert,
  Flex,
  Switch,
  Loader,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useState } from "react";
import XMLParser from "react-xml-parser";

function App() {
  const [id, setID] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [data, setData] = useState(null);
  const [errorText, setErrorText] = useState(null);
  const [sendAsXML, setSendAsXML] = useState(false);
  const [authors, setAuthors] = useState(null);
  const [loading, setLoading] = useState(false);

  const host = "http://172.20.10.3:8080";

  const onClickLoadList = () => {
    setLoading(true);
    setErrorText(null);
    if (sendAsXML) {
      fetch(`${host}/persons`, {
        headers: {
          Accept: "application/xml",
          ContentType: "application/xml",
        },
      })
        .then((response) => response.text())
        .then((data) => {
          const xml = new XMLParser().parseFromString(data);
          const json = xml.children.map((item) => {
            const obj = {};
            item.children.forEach((child) => {
              obj[child.name] = child.value;
            });
            return obj;
          });
          setData(json);
          setErrorText(null);
          setLoading(false);
        })
        .catch((error) => {
          console.log({ error });
          setLoading(false);
        });
      return;
    }
    fetch(`${host}/persons`)
      .then((response) => response.json())
      .then((data) => {
        if (data.detail) {
          setErrorText(data.detail);
        } else {
          setErrorText(null);
          setData(data);
          setLoading(false);
        }
      })
      .catch((error) => {
        setErrorText(error);
        setLoading(false);
      });
  };

  const onClickLoadAuthors = () => {
    setLoading(true);
    setErrorText(null);
    fetch(`${host}/authors`)
      .then((response) => response.json())
      .then((data) => {
        if (data.detail) {
          setErrorText(data.detail);
        } else {
          setErrorText(null);
          setAuthors(data.authors);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  };

  const onClickLoad = () => {
    if (id === "") {
      setErrorText("Podaj poprawne ID");
      return;
    }
    setLoading(false);
    setErrorText(null);
    if (sendAsXML) {
      fetch(`${host}/persons/${id}`, {
        headers: {
          Accept: "application/xml",
        },
      })
        .then((response) => response.text())
        .then((data) => {
          if (data[0] === "{") {
            const parsed = JSON.parse(data);
            if (parsed.detail) {
              setErrorText(parsed.detail);
              return;
            }
          }
          const xml = new XMLParser().parseFromString(data);
          const person = xml.children.reduce((acc, item) => {
            acc[item.name] = item.value;
            return acc;
          }, {});
          setData([person]);
          setErrorText(null);
          setLoading(false);
        })
        .catch((error) => {
          console.log({ error });
          setLoading(false);
        });
      return;
    }
    fetch(`${host}/persons/${id}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.detail) {
          setErrorText(data.detail);
        } else {
          setErrorText(null);
          setData([data]);
          setLoading(false);
        }
      })
      .catch((error) => {
        setErrorText(error);
        setLoading(false);
      });
  };

  const onClickUpdate = () => {
    setLoading(true);
    setErrorText(null);
    fetch(`${host}/persons/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": sendAsXML ? "application/xml" : "application/json",
      },
      body: sendAsXML
        ? `<person>${name && `<name>${name}</name>`}${
            age && `<age>${age}</age>`
          }${email && `<email>${email}</email>`}</person>`
        : JSON.stringify({
            ...(name && { name }),
            ...(age && { age }),
            ...(email && { email }),
          }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.detail) {
          setErrorText(data.detail);
        } else {
          setErrorText(null);
          onClickLoadList();
        }
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  };

  const onClickDelete = () => {
    if (id === "") {
      setErrorText("Podaj poprawne ID");
      return;
    }
    setLoading(true);
    setErrorText(null);
    fetch(`${host}/persons/${id}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.detail) {
          setErrorText(data.detail);
        } else {
          setErrorText(null);
          onClickLoadList();
        }
        setLoading(false);
      })
      .catch((error) => {
        setErrorText(error);
        setLoading(false);
      });
  };

  const onClickAdd = () => {
    setLoading(true);
    setErrorText(null);
    fetch(`${host}/persons`, {
      method: "POST",
      headers: {
        "Content-Type": sendAsXML ? "application/xml" : "application/json",
      },
      body: sendAsXML
        ? `<person>${name && `<name>${name}</name>`}${
            age && `<age>${age}</age>`
          }${email && `<email>${email}</email>`}</person>`
        : JSON.stringify({
            ...(name && { name }),
            ...(age && { age }),
            ...(email && { email }),
          }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.detail) {
          setErrorText(data.detail);
        } else {
          setErrorText(null);
          onClickLoadList();
        }
        setLoading(false);
      })
      .catch((error) => {
        console.log({ error });
        setErrorText(error);
        setLoading(false);
      });
  };

  return (
    <Container style={{ padding: "50px" }}>
      <Flex gap="lg" direction="column">
        <Flex justify="space-between" align="flex-end">
          <NumberInput
            value={id}
            onChange={(value) => setID(value)}
            label="ID"
            placeholder="Podaj ID"
            min={0}
          />
          <TextInput
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
            label="Imię"
            placeholder="Podaj imię"
          />
          <NumberInput
            value={age}
            onChange={(value) => setAge(value)}
            label="Wiek"
            placeholder="Podaj wiek"
            min={0}
          />
          <TextInput
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            label="Email"
            placeholder="Podaj email"
          />
          <Button color="pink" onClick={onClickLoadAuthors}>
            Autorzy
          </Button>
        </Flex>

        {authors && (
          <Alert
            icon={<IconAlertCircle size="1rem" />}
            title="Autorzy!"
            color="grape"
          >
            {authors}
          </Alert>
        )}

        <Group position="apart">
          <Button onClick={onClickLoadList}>Wczytaj listę</Button>
          <Button onClick={onClickLoad} disabled={id === ""}>
            Wczytaj pozycję
          </Button>
          <Button
            onClick={onClickUpdate}
            disabled={id === "" || (!name && !age && !email)}
          >
            Zaktualizuj pozycję
          </Button>
          <Button onClick={onClickDelete} disabled={id === ""}>
            Usuń pozycję
          </Button>
          <Button onClick={onClickAdd} disabled={!name && !age && !email}>
            Dodaj pozycję
          </Button>
          <Switch
            w="100px"
            checked={sendAsXML}
            onChange={() => setSendAsXML((v) => !v)}
            onLabel="XML"
            offLabel="JSON"
            size="xl"
          />
        </Group>

        {loading && (
          <Container>
            <Loader />
          </Container>
        )}

        {errorText && (
          <Alert
            icon={<IconAlertCircle size="1rem" />}
            title="Błąd"
            color="red"
          >
            {errorText}
          </Alert>
        )}
        {data?.length === 0 && !errorText && (
          <Alert
            icon={<IconAlertCircle size="1rem" />}
            title="Brak danych"
            color="gray"
          >
            Brak danych do wyświetlenia
          </Alert>
        )}
        {data?.length > 0 && !errorText && (
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th style={{ width: "25%" }}>ID</th>
                <th style={{ width: "25%" }}>Imię</th>
                <th style={{ width: "25%" }}>Wiek</th>
                <th style={{ width: "25%" }}>Email</th>
              </tr>
            </thead>
            <tbody>
              {data.map((person) => (
                <tr key={person.id}>
                  <td>{person.id}</td>
                  <td>{person.name}</td>
                  <td>{person.age}</td>
                  <td>{person.email}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Flex>
    </Container>
  );
}

export default App;
