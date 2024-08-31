import Layout, { Content } from "antd/es/layout/layout"
import ChatList from "./list";

const Chat = function() {
  return <Layout style={{ height: '100%' }}>
    <ChatList />
    <Content>
      content
    </Content>
  </Layout>
}

export default Chat;
