import { FormData } from "@/components/main/contact-us";
import formData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.NEXT_PUBLIC_MAILGUN_API_KEY || "",
});

export function sendEmail(
  data: FormData,
  setMessage: (message: string) => void,
  setMessageType: (messageType: boolean) => void
) {
  const domain = "fusan.live";
  mg.messages
    .create(domain, {
      from: `${data.name} <mailgun@fusan.live>`,
      to: "fuad.antor@gmail.com",
      cc: `${data.email}`,
      subject: `[${data.name}] Portfolio Contact Form`,
      text: data.message,
      html: `    <div
      style={{
        fontFamily: "Helvetica, sans-serif",
        WebkitFontSmoothing: "antialiased",
        fontSize: "16px",
        lineHeight: "1.3",
        WebkitTextSizeAdjust: "100%",
        backgroundColor: "#f4f5f6",
        margin: "0",
        padding: "0",
      }}
    >
      <table
        className="body"
        style={{
          borderCollapse: "separate",
          backgroundColor: "#f4f5f6",
          width: "100%",
        }}
        role="presentation"
        border={0}
        width="100%"
        cellSpacing="0"
        cellPadding="0"
      >
        <tbody>
          <tr>
            <td
              style={{
                fontFamily: "Helvetica, sans-serif",
                fontSize: "16px",
                verticalAlign: "top",
                width: "18.8211%",
              }}
              valign="top"
            >
              &nbsp;
            </td>
            <td
              className="container"
              style={{
                fontFamily: "Helvetica, sans-serif",
                fontSize: "16px",
                verticalAlign: "top",
                maxWidth: "600px",
                padding: "24px 0px 0px",
                width: "62.2544%",
                margin: "0px auto",
              }}
              valign="top"
              width="600"
            >
              <div
                className="content"
                style={{
                  boxSizing: "border-box",
                  display: "block",
                  margin: "0 auto",
                  maxWidth: "600px",
                  padding: "0",
                }}
              >
                <span
                  className="preheader"
                  style={{
                    color: "transparent",
                    display: "none",
                    height: "0",
                    maxHeight: "0",
                    maxWidth: "0",
                    opacity: "0",
                    overflow: "hidden",
                    visibility: "hidden",
                    width: "0",
                  }}
                >
                  Portfolio Contact Form
                </span>
                <table
                  className="main"
                  style={{
                    borderCollapse: "separate",
                    background: "#ffffff",
                    border: "1px solid #eaebed",
                    borderRadius: "16px",
                    width: "100%",
                  }}
                  role="presentation"
                  border={0}
                  width="100%"
                  cellSpacing="0"
                  cellPadding="0"
                >
                  <tbody>
                    <tr>
                      <td
                        className="wrapper"
                        style={{
                          fontFamily: "Helvetica, sans-serif",
                          fontSize: "16px",
                          verticalAlign: "top",
                          boxSizing: "border-box",
                          padding: "24px",
                        }}
                        valign="top"
                      >
                        <p
                          style={{
                            fontFamily: "Helvetica, sans-serif",
                            fontSize: "16px",
                            fontWeight: "normal",
                            margin: "0",
                            marginBottom: "16px",
                          }}
                        >
                          ${data.message}
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div
                  className="footer"
                  style={{
                    clear: "both",
                    paddingTop: "24px",
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  <table
                    style={{
                      borderCollapse: "separate",
                      width: "100%",
                    }}
                    role="presentation"
                    border={0}
                    width="100%"
                    cellSpacing="0"
                    cellPadding="0"
                  >
                    <tbody>
                      <tr>
                        <td
                          className="content-block"
                          style={{
                            fontFamily: "Helvetica, sans-serif",
                            verticalAlign: "top",
                            color: "#9a9ea6",
                            fontSize: "16px",
                            textAlign: "center",
                          }}
                          align="center"
                          valign="top"
                        >
                          <span
                            className="apple-link"
                            style={{
                              color: "#9a9ea6",
                              fontSize: "16px",
                              textAlign: "center",
                            }}
                          >
                            Fuad Hasan [<a href="https://www.fusan.live" style={{ color: "#9a9ea6" }}>fusan.live</a>]
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </td>
            <td
              style={{
                fontFamily: "Helvetica, sans-serif",
                fontSize: "16px",
                verticalAlign: "top",
                width: "18.8211%",
              }}
              valign="top"
            >
              &nbsp;
            </td>
          </tr>
        </tbody>
      </table>
    </div>`,
    })
    .then((msg) => {
      setMessage("Email sent successfully.");
      setMessageType(true);
    })
    .catch((err) => {
      setMessage("Failed to send email.");
      console.log(err);
      setMessageType(false);
    });
}
