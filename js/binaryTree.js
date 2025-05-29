class TreeNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.up = null;
    }
}

class BinaryTree {
    constructor(value) {
        this.root = new TreeNode(value);
    }

    // 插入节点
    insert(value) {
        const newNode = new TreeNode(value);
        if (!this.root) {
            this.root = newNode;
        } else {
            this.insertNode(this.root, newNode);
        }
    }

    insertNode(node, newNode) {
        if (newNode.value < node.value) {
            if (!node.left) {
                node.left = newNode;
            } else {
                this.insertNode(node.left, newNode);
            }
        } else {
            if (!node.right) {
                node.right = newNode;
            } else {
                this.insertNode(node.right, newNode);
            }
        }
    }

    // 前序遍历（根-左-右）
    preOrderTraversal(node, callback) {
        if (node !== null) {
            callback(node.value); // 访问根节点
            this.preOrderTraversal(node.left, callback); // 递归左子树
            this.preOrderTraversal(node.right, callback); // 递归右子树
        }
    }

    // 中序遍历（左-根-右）
    inOrderTraversal(node, callback) {
        if (node !== null) {
            this.inOrderTraversal(node.left, callback); // 递归左子树
            callback(node.value); // 访问根节点
            this.inOrderTraversal(node.right, callback); // 递归右子树
        }
    }

    // 后序遍历（左-右-根）
    postOrderTraversal(node, callback) {
        if (node !== null) {
            this.postOrderTraversal(node.left, callback); // 递归左子树
            this.postOrderTraversal(node.right, callback); // 递归右子树
            callback(node); // 访问根节点
        }
    }
}

function branchHash(node) {
    if (node.value == '') {
        let A = Buffer.Buffer.from(node.left.value, 'hex');
        let B = Buffer.Buffer.from(node.right.value, 'hex');
        node.value = bitcoin.crypto.taggedHash(
            'TapBranch',
            Buffer.Buffer.concat([A < B ? A : B, A < B ? B : A])
        ).toString('hex');
    }
}

function merkle2binaryTree(merkle, parentNode) {
    if (merkle.length == 0) {
        return;
    }

    if (!Array.isArray(merkle[0])) {//左子树为叶子
        let s = `c0${varuintPre(merkle[0].output)}`
        const leafHash = bitcoin.crypto.taggedHash('TapLeaf', Buffer.Buffer.from(s, 'hex'));
        const node = new TreeNode(leafHash.toString('hex'));
        node.left = new TreeNode(merkle[0].output.toString('hex'));
        parentNode.left = node;
        node.up = parentNode;
        node.left.up = node;
        leaf_scripts.push(node.left);
    } else if (Array.isArray(merkle[0])) {//左子树为默克尔树
        parentNode.left = new TreeNode('');
        parentNode.left.up = parentNode;
        merkle2binaryTree(merkle[0], parentNode.left);
    }

    if (!Array.isArray(merkle[1])) {//右子树为叶子
        let s = `c0${varuintPre(merkle[1].output)}`
        const leafHash = bitcoin.crypto.taggedHash('TapLeaf', Buffer.Buffer.from(s, 'hex'));
        const node = new TreeNode(leafHash.toString('hex'));
        node.left = new TreeNode(merkle[1].output.toString('hex'));
        parentNode.right = node;
        node.up = parentNode;
        node.left.up = node;
        leaf_scripts.push(node.left);
    } else if (Array.isArray(merkle[1])) {//右子树为默克尔树
        parentNode.right = new TreeNode('');
        parentNode.right.up = parentNode;
        merkle2binaryTree(merkle[1], parentNode.right);
    }
}

function concat_paths(node, sib) {
    if (node.up) {
        s = sib + node.up.left == node ? node.up.right.value : node.up.left.value;
        return s + concat_paths(node.up, s);
    }
}

