(function() {
    if (window.hasRun) {
      return;
    }
    window.hasRun = true;
    
    async function insertComments(inlineComments) {
      console.log(inlineComments);
      const page = document.body.innerHTML;
      for (var i = 0; i < inlineComments.length; i++) {
        let comment = inlineComments[i].comment_text;
        let link = linkToComment(inlineComments[i].objectID)
        let quote = findQuote(comment);
        highlight(quote, link, page);
      }
    }

    chrome.runtime.onMessage.addListener((message) => {
      if (message.command === "insertComments") {
        insertComments(message.data);
      }
    });
  })();

function linkToComment(commentId) {
  return "https://news.ycombinator.com/item?id=" + commentId
}

function findQuote(comment) {
  let decoded = decodeHtml(comment)
  let indentRemoved = decoded.replace(">", "");
  let trimmed = indentRemoved.trim();
  let split = trimmed.split("<p>")[0];
  return split
}

function decodeHtml(html) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function highlight(comment, link, page) {
  console.log(comment)
}
  