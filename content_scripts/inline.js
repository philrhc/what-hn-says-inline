(function() {
    if (window.hasRun) {
      return;
    }
    window.hasRun = true;
    // let hasHighlighted = false;    
    
    async function insertComments(inlineComments) {
      // if (hasHighlighted) {
      //   return;
      // }
      // hasHighlighted = true;

      console.log(inlineComments);
      for (var i = 0; i < inlineComments.length; i++) {
        let comment = inlineComments[i];
        let author = comment.author;
        let text = comment.comment_text;
        let link = linkToComment(comment.objectID)
        let quote = findQuote(text);
        let commentOnQuote = findComment(text);
        highlight(quote, author, commentOnQuote, link);
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
  let split = comment.split("<p>")[0];
  let indentRemoved = split.replace("&gt;", "");
  let quotesRemoved = indentRemoved.replace("&quot;", "");
  let decoded = decodeHtml(quotesRemoved)
  let quotedAgainRemoved = decoded.replace('"', "");
  let trimmed = quotedAgainRemoved.trim();
  return trimmed;
}

function findComment(comment) {
  let split = comment.split("<p>").slice(1);
  let recombined = recombineComment(split);
  let decoded = decodeHtml(recombined);
  let quotedAgainRemoved = decoded.replace('"', "");
  let trimmed = quotedAgainRemoved.trim();
  return trimmed;
}

function recombineComment(splitComment) {
  let comment = "";
  for (var i = 0; i < splitComment.length; i++) {
    comment += splitComment[i] + '<br /><br />';
  }
  return comment;
}

function decodeHtml(html) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function highlight(quote, author, comment, link) {
  console.log(quote);

  var xpath = `//p[contains(text(),'${quote}')]`;
  var matchingElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

  let insert = `
    <div class="phil-highlight">
       ${quote}
       <div class="phil-extension">
          <div class="phil-extension-header">
            <a href="https://news.ycombinator.com/user?id=${author}">${author}</a>
          </div>
          <div class="phil-comment">
            <p>${comment}</p>
          </div>
       </div>
     </div>
  `;

  matchingElement.innerHTML = matchingElement.innerHTML.replace(new RegExp(quote, "gi"), insert);
}
  