import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

// The site's palette (see app/globals.css). Email clients can't load the
// site fonts, so each family falls back to a close system face.
const carbon = "#0F1226";
const form = "#E6E2D6";
const stamp = "#E0473A";
const display = "Georgia, 'Times New Roman', serif";
const body = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const mono = "'Courier New', Courier, monospace";

const label = {
  margin: "0 0 4px",
  fontFamily: mono,
  fontSize: "11px",
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  color: "rgba(15, 18, 38, 0.65)",
};

const field = {
  padding: "16px 0",
  borderBottom: "1px solid rgba(15, 18, 38, 0.2)",
};

type Props = {
  name: string;
  email: string;
  message: string;
  receivedAt: string;
};

// The contact form, re-printed as a filed record: the same paper intake
// form the visitor filled in, stamped Received.
export function ContactNotification({
  name,
  email,
  message,
  receivedAt,
}: Props) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{message.slice(0, 120)}</Preview>
      <Body
        style={{ margin: 0, padding: "32px 12px", backgroundColor: carbon }}
      >
        <Container style={{ maxWidth: "560px", margin: "0 auto" }}>
          <Text
            style={{
              ...label,
              margin: "0 0 12px",
              color: "rgba(230, 226, 214, 0.6)",
            }}
          >
            fusan.me / Contact
          </Text>

          <Section
            style={{ backgroundColor: form, padding: "28px 28px 32px" }}
          >
            <table
              width="100%"
              cellPadding={0}
              cellSpacing={0}
              role="presentation"
              style={{ borderBottom: `2px solid ${carbon}` }}
            >
              <tbody>
                <tr>
                  <td style={{ paddingBottom: "10px" }}>
                    <Text style={{ ...label, margin: 0 }}>Intake form</Text>
                  </td>
                  <td align="right" style={{ paddingBottom: "10px" }}>
                    <Text style={{ ...label, margin: 0 }}>{receivedAt}</Text>
                  </td>
                </tr>
              </tbody>
            </table>

            <table
              width="100%"
              cellPadding={0}
              cellSpacing={0}
              role="presentation"
            >
              <tbody>
                <tr>
                  <td style={{ paddingTop: "24px" }}>
                    <Text
                      style={{
                        margin: 0,
                        fontFamily: display,
                        fontSize: "28px",
                        lineHeight: "1.2",
                        color: carbon,
                      }}
                    >
                      New message
                    </Text>
                  </td>
                  <td
                    align="right"
                    valign="bottom"
                    style={{ paddingTop: "24px" }}
                  >
                    <Text
                      style={{
                        display: "inline-block",
                        margin: 0,
                        padding: "4px 10px",
                        border: `3px solid ${stamp}`,
                        fontFamily: mono,
                        fontSize: "14px",
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: stamp,
                      }}
                    >
                      Received
                    </Text>
                  </td>
                </tr>
              </tbody>
            </table>

            <Section style={{ marginTop: "12px" }}>
              <Section style={field}>
                <Text style={label}>Name</Text>
                <Text
                  style={{
                    margin: 0,
                    fontFamily: body,
                    fontSize: "17px",
                    color: carbon,
                  }}
                >
                  {name}
                </Text>
              </Section>

              <Section style={field}>
                <Text style={label}>Email</Text>
                <Link
                  href={`mailto:${email}`}
                  style={{
                    fontFamily: body,
                    fontSize: "17px",
                    color: carbon,
                    textDecoration: "underline",
                  }}
                >
                  {email}
                </Link>
              </Section>

              <Section style={{ ...field, borderBottom: "none" }}>
                <Text style={label}>Message</Text>
                <Text
                  style={{
                    margin: 0,
                    fontFamily: body,
                    fontSize: "16px",
                    lineHeight: "1.6",
                    color: carbon,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {message}
                </Text>
              </Section>
            </Section>

            <Button
              href={`mailto:${email}?subject=${encodeURIComponent("Re: your message")}`}
              style={{
                marginTop: "12px",
                padding: "12px 22px",
                backgroundColor: stamp,
                fontFamily: mono,
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: carbon,
              }}
            >
              Reply to {name.split(" ")[0]}
            </Button>
          </Section>

          <Text
            style={{
              margin: "16px 0 0",
              fontFamily: body,
              fontSize: "12px",
              lineHeight: "1.5",
              color: "rgba(230, 226, 214, 0.55)",
            }}
          >
            Sent from the contact form on fusan.me. Replying to this email
            goes straight to {email}.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

ContactNotification.PreviewProps = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message:
    "Hi Fuad,\n\nWe have three intake spreadsheets that disagree with each other. Could we talk about normalizing them?\n\nThanks,\nAda",
  receivedAt: "20 Nov 2026, 14:05 GMT+6",
} satisfies Props;

export default ContactNotification;
